import { Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import DocumentModel, { IDocument } from '../models/Document';
import { IAuthRequest } from '../types';

/**
 * Voyage AI API response structure
 */
interface VoyageEmbeddingResponse {
    data: Array<{
        embedding: number[];
    }>;
}

/**
 * Initialize Google Gemini AI
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate text embeddings using Voyage AI
 * @param {string} text - Text to embed
 * @returns {Promise<number[] | null>} Embedding vector
 */
const generateEmbedding = async (text: string): Promise<number[] | null> => {
    try {
        console.log('🔢 Generating embedding for text:', text.substring(0, 50) + '...');

        const response: AxiosResponse<VoyageEmbeddingResponse> = await axios.post(
            'https://api.voyageai.com/v1/embeddings',
            {
                input: text,
                model: 'voyage-2'
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data && response.data.data && response.data.data[0]) {
            console.log('✅ Embedding generated successfully');
            return response.data.data[0].embedding;
        }

        throw new Error('Invalid response from Voyage AI');
    } catch (error) {
        const err = error as any;
        console.error('❌ Error generating embedding:', err.message);

        // If Voyage AI fails, return null (we'll use text search instead)
        if (err.response) {
            console.error('Voyage AI API error:', err.response.data);
        }
        return null;
    }
};

/**
 * Find relevant documents for RAG
 * @param {string} query - User query
 * @param {number} limit - Max documents to return
 * @returns {Promise<IDocument[]>} Relevant documents
 */
const findRelevantDocuments = async (query: string, limit: number = 3): Promise<IDocument[]> => {
    try {
        console.log('🔍 Searching for relevant documents...');

        // Try to use text search
        const documents = await DocumentModel.findSimilar(query, limit);

        if (documents && documents.length > 0) {
            console.log(`✅ Found ${documents.length} relevant documents`);
            return documents;
        }

        console.log('ℹ️  No relevant documents found');
        return [];
    } catch (error) {
        console.error('❌ Error finding relevant documents:', error);
        return [];
    }
};

/**
 * Generate AI response using Google Gemini
 * @param {string} question - User question
 * @param {IDocument[]} context - Relevant documents for context
 * @returns {Promise<string>} AI response
 */
const generateAIResponse = async (question: string, context: IDocument[] = []): Promise<string> => {
    try {
        console.log('🤖 Generating AI response with Gemini...');

        // Initialize Gemini model
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Build context from documents
        let contextText = '';
        if (context.length > 0) {
            contextText = '\n\nRelevant Information from Campus Safety Documents:\n';
            context.forEach((doc, index) => {
                contextText += `\n${index + 1}. ${doc.title}\n${doc.content.substring(0, 500)}...\n`;
            });
        }

        // System prompt for university safety assistant
        const systemPrompt = `You are a helpful AI assistant for ASTU (Addis Science and Technology University) Smart Campus Safety Platform. Your role is to:

1. Provide accurate information about campus safety procedures, emergency protocols, and resources
2. Answer student questions about campus security, health services, and emergency contacts
3. Offer guidance on reporting incidents and accessing safety resources
4. Be concise, clear, and supportive in your responses
5. If you don't know something, admit it and suggest contacting campus security or administration

Always prioritize student safety and well-being in your responses.`;

        // Combine system prompt, context, and user question
        const fullPrompt = `${systemPrompt}${contextText}\n\nStudent Question: ${question}\n\nAssistant Response:`;

        // Generate response
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        console.log('✅ AI response generated successfully');
        console.log('Response preview:', text.substring(0, 100) + '...');

        return text;
    } catch (error) {
        const err = error as Error;
        console.error('❌ Error generating AI response:', err.message);

        if (err.message && err.message.includes('API_KEY')) {
            throw new Error('Gemini API key is invalid or missing');
        }

        // Fallback response
        return 'I apologize, but I\'m having trouble generating a response right now. Please try again later or contact campus security directly for urgent matters.';
    }
};

/**
 * @desc    Ask chatbot a question (RAG implementation)
 * @route   POST /api/chat/ask
 * @access  Private
 */
export const askQuestion = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { question } = req.body;

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
            return;
        }

        console.log('💬 Chat request from user:', req.user.email);
        console.log('Question:', question);

        // Validate question
        if (!question || question.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: 'Please provide a question'
            });
            return;
        }

        if (question.length > 1000) {
            res.status(400).json({
                success: false,
                message: 'Question is too long (max 1000 characters)'
            });
            return;
        }

        // Step 1: Find relevant documents (RAG retrieval)
        const relevantDocs = await findRelevantDocuments(question, 3);

        // Step 2: Generate AI response with context (RAG generation)
        const aiResponse = await generateAIResponse(question, relevantDocs);

        // Step 3: Return response
        res.status(200).json({
            success: true,
            data: {
                question,
                answer: aiResponse,
                sources: relevantDocs.map(doc => ({
                    id: doc._id,
                    title: doc.title,
                    category: doc.category
                })),
                timestamp: new Date()
            }
        });

        console.log('✅ Chat response sent successfully');
    } catch (error) {
        const err = error as Error;
        console.error('❌ Chat error:', err);
        res.status(500).json({
            success: false,
            message: 'Error processing your question',
            error: err.message
        });
    }
};

/**
 * @desc    Upload document for RAG system
 * @route   POST /api/chat/upload
 * @access  Private (Admin only)
 */
export const uploadDocument = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { title, content, category, tags } = req.body;

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
            return;
        }

        console.log('📄 Document upload from user:', req.user.email);

        // Validate input
        if (!title || !content) {
            res.status(400).json({
                success: false,
                message: 'Please provide title and content'
            });
            return;
        }

        // Generate embedding for the document
        const embedding = await generateEmbedding(content);

        // Create document
        const document = await DocumentModel.create({
            title,
            content,
            category: category || 'other',
            tags: tags || [],
            embedding,
            uploadedBy: req.user.id,
            isPublic: true
        });

        console.log('✅ Document uploaded successfully:', document.title);

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            data: {
                document: {
                    id: document._id,
                    title: document.title,
                    category: document.category,
                    createdAt: document.createdAt
                }
            }
        });
    } catch (error) {
        const err = error as Error;
        console.error('❌ Document upload error:', err);
        res.status(500).json({
            success: false,
            message: 'Error uploading document',
            error: err.message
        });
    }
};

/**
 * @desc    Get all documents
 * @route   GET /api/chat/documents
 * @access  Private
 */
export const getDocuments = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const { category, search, limit = '20', page = '1' } = req.query;

        console.log('📚 Fetching documents...');

        // Build query
        const query: any = { isPublic: true };
        if (category) query.category = category;
        if (search) {
            query.$text = { $search: search as string };
        }

        // Parse pagination params
        const limitNum = parseInt(limit as string);
        const pageNum = parseInt(page as string);

        // Execute query with pagination
        const documents = await DocumentModel.find(query)
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        const total = await DocumentModel.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                documents,
                pagination: {
                    total,
                    page: pageNum,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });
    } catch (error) {
        const err = error as Error;
        console.error('❌ Get documents error:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching documents',
            error: err.message
        });
    }
};
