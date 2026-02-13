import mongoose, { Document, Schema, Model } from 'mongoose';

/**
 * Chat Message interface
 */
export interface IChat extends Document {
    user: mongoose.Types.ObjectId;
    conversation: mongoose.Types.ObjectId;
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Chat Schema
 * Stores chat history between users and the AI assistant
 */
const chatSchema = new Schema<IChat>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true // Index for faster lookups by user
        },
        conversation: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
            index: true
        },
        role: {
            type: String,
            enum: ['user', 'model'],
            required: true
        },
        text: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Compound index for sorted history retrieval
chatSchema.index({ conversation: 1, timestamp: 1 });

const Chat: Model<IChat> = mongoose.model<IChat>('Chat', chatSchema);
export { Chat };
export default Chat;
