const mongoose = require('mongoose');

/**
 * Document Schema
 * Stores uploaded documents with embeddings for RAG system
 */
const documentSchema = new mongoose.Schema(
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
            type: mongoose.Schema.Types.ObjectId,
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
documentSchema.methods.incrementViewCount = async function () {
    this.viewCount += 1;
    await this.save();
};

/**
 * Static method to find similar documents (basic implementation)
 * In production, use vector similarity search
 */
documentSchema.statics.findSimilar = async function (keywords, limit = 5) {
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

module.exports = mongoose.model('Document', documentSchema);
