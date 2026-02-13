import mongoose, { Document, Schema, Model } from 'mongoose';

/**
 * Conversation interface
 */
export interface IConversation extends Document {
    title: string;
    user: mongoose.Types.ObjectId;
    lastMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Conversation Schema
 * Groups chat messages into sessions
 */
const conversationSchema = new Schema<IConversation>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            default: 'New Chat'
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        lastMessage: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// Index for fetching a user's conversations sorted by date
conversationSchema.index({ user: 1, updatedAt: -1 });

const Conversation: Model<IConversation> = mongoose.model<IConversation>('Conversation', conversationSchema);
export { Conversation };
export default Conversation;
