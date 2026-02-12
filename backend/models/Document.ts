import mongoose, { Document, Schema, Model } from 'mongoose';
import { IUser } from './User';

/**
 * Document interface - defines the shape of a Document document
 */
export interface IDocument extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    content: string;
    category: 'safety' | 'emergency' | 'policy' | 'procedure' | 'resource' | 'other';
    embedding: number[];
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    uploadedBy: mongoose.Types.ObjectId | IUser;
    isPublic: boolean;
    tags: string[];
    viewCount: number;
    // Chunking support
    isChunk: boolean;
    parentDocumentId?: mongoose.Types.ObjectId;
    chunkIndex?: number;
    chunkCount?: number;
    createdAt: Date;
    updatedAt: Date;
    incrementViewCount(): Promise<void>;
}

/**
 * Document Model with static methods
 */
export interface IDocumentModel extends Model<IDocument> {
    findSimilar(keywords: string, limit?: number): Promise<IDocument[]>;
    vectorSearch(queryEmbedding: number[], limit?: number): Promise<Array<IDocument & { similarity: number }>>;
}

/**
 * Document Schema
 * Stores uploaded documents with embeddings for RAG system
 */
const documentSchema = new Schema<IDocument, IDocumentModel>(
    {
        title: {
            type: String,
            required: [true, 'Please add a document title'],
            trim: true,
            maxlength: [200, 'Title cannot be more than 200 characters']
        },
        content: {
            type: String,
            required: [true, 'Please add document content'],
            maxlength: [50000, 'Content cannot exceed 50000 characters']
        },
        category: {
            type: String,
            enum: ['safety', 'emergency', 'policy', 'procedure', 'resource', 'other'],
            default: 'other'
        },
        // Embedding vector for similarity search
        embedding: {
            type: [Number],
            default: []
        },
        // Metadata
        fileName: {
            type: String,
            trim: true
        },
        fileType: {
            type: String,
            trim: true
        },
        fileSize: {
            type: Number // Size in bytes
        },
        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        isPublic: {
            type: Boolean,
            default: true
        },
        tags: [{
            type: String,
            trim: true
        }],
        viewCount: {
            type: Number,
            default: 0
        },
        // Chunking fields
        isChunk: {
            type: Boolean,
            default: false
        },
        parentDocumentId: {
            type: Schema.Types.ObjectId,
            ref: 'Document',
            required: false
        },
        chunkIndex: {
            type: Number,
            required: false
        },
        chunkCount: {
            type: Number,
            required: false
        }
    },
    {
        timestamps: true // Adds createdAt and updatedAt
    }
);

/**
 * Index for faster text search
 */
documentSchema.index({ title: 'text', content: 'text', tags: 'text' });

/**
 * Index for category filtering
 */
documentSchema.index({ category: 1, isPublic: 1 });

/**
 * Method to increment view count
 */
documentSchema.methods.incrementViewCount = async function (): Promise<void> {
    this.viewCount += 1;
    await this.save();
};

/**
 * Static method to find similar documents using Atlas Vector Search
 * @param queryEmbedding - The embedding vector for the query
 * @param limit - Max results to return
 */
documentSchema.statics.vectorSearch = async function (
    queryEmbedding: number[],
    limit: number = 3
): Promise<Array<IDocument & { similarity: number }>> {
    try {
        console.log(`🔍 Executing Atlas Vector Search (limit: ${limit})...`);

        const results = await this.aggregate([
            {
                $vectorSearch: {
                    index: 'vertex_search',
                    path: 'embedding',
                    queryVector: queryEmbedding,
                    numCandidates: limit * 10,
                    limit: limit
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    content: 1,
                    category: 1,
                    tags: 1,
                    isChunk: 1,
                    parentDocumentId: 1,
                    chunkIndex: 1,
                    chunkCount: 1,
                    similarity: { $meta: 'vectorSearchScore' }
                }
            }
        ]);

        return results;
    } catch (error) {
        console.error('❌ Atlas Vector Search failed:', error);
        throw error;
    }
};

/**
 * Static method to find similar documents (basic implementation)
 * In production, use vector similarity search
 */
documentSchema.statics.findSimilar = async function (
    keywords: string,
    limit: number = 5
): Promise<IDocument[]> {
    try {
        return await this.find(
            {
                $text: { $search: keywords },
                isPublic: true
            },
            { score: { $meta: 'textScore' } }
        )
            .sort({ score: { $meta: 'textScore' } })
            .limit(limit)
            .populate('uploadedBy', 'name email');
    } catch (error) {
        console.error('❌ Error finding similar documents:', error);
        throw error;
    }
};

const DocumentModel: IDocumentModel = mongoose.model<IDocument, IDocumentModel>('Document', documentSchema);

export default DocumentModel;
