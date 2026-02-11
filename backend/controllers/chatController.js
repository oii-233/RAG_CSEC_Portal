const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Document = require('../models/Document');

/**
 * Initialize Google Gemini AI
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate text embeddings using Voyage AI
 * @param {string} text - Text to embed
 * @returns {Promise<Array>} Embedding vector
 */
const generateEmbedding = async (text) => {
    try {
        console.log('🔢 Generating embedding for text:', text.substring(0, 50) + '...');

        const response = await axios.post(
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
        console.error('❌ Error generating embedding:', error.message);

        // If Voyage AI fails, return null (we'll use text search instead)
        if (error.response) {
            console.error('Voyage AI API error:', error.response.data);
        }
        return null;
    }
};

/**
 * Find relevant documents for RAG
 * @param {string} query - User query
 * @param {number} limit - Max documents to return
 * @returns {Promise<Array>} Relevant documents
 */
const findRelevantDocuments = async (query, limit = 3) => {
    try {
        console.log('🔍 Searching for relevant documents...');

        // Try to use text search
        const documents = await Document.findSimilar(query, limit);

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
 * @param {Array} context - Relevant documents for context
 * @returns {Promise<string>} AI response
 */
const generateAIResponse = async (question, context = []) => {
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
        console.error('❌ Error generating AI response:', error.message);

        if (error.message && error.message.includes('API_KEY')) {
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
const askQuestion = async (req, res) => {
    try {
        const { question } = req.body;

        console.log('💬 Chat request from user:', req.user.email);
        console.log('Question:', question);

        // Validate question
        if (!question || question.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a question'
            });
        }

        if (question.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Question is too long (max 1000 characters)'
            });
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
        console.error('❌ Chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing your question',
            error: error.message
        });
    }
};

/**
 * @desc    Upload document for RAG system
 * @route   POST /api/chat/upload
 * @access  Private (Admin only)
 */
const uploadDocument = async (req, res) => {
    try {
        const { title, content, category, tags } = req.body;

        console.log('📄 Document upload from user:', req.user.email);

        // Validate input
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title and content'
            });
        }

        // Generate embedding for the document
        const embedding = await generateEmbedding(content);

        // Create document
        const document = await Document.create({
            title,
            content,
            category: category || 'other',
            tags: tags || [],
            embedding,
            uploadedBy: req.user._id,
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
        console.error('❌ Document upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading document',
            error: error.message
        });
    }
};

/**
 * @desc    Get all documents
 * @route   GET /api/chat/documents
 * @access  Private
 */
const getDocuments = async (req, res) => {
    try {
        const { category, search, limit = 20, page = 1 } = req.query;

        console.log('📚 Fetching documents...');

        // Build query
        const query = { isPublic: true };
        if (category) query.category = category;
        if (search) {
            query.$text = { $search: search };
        }

        // Execute query with pagination
        const documents = await Document.find(query)
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Document.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                documents,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('❌ Get documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching documents',
            error: error.message
        });
    }
};

module.exports = {
    askQuestion,
    uploadDocument,
    getDocuments
};
