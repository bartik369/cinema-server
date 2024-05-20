import mongoose from "mongoose";
const { Schema } = mongoose;

const ConversationSchema = new Schema({
    creatorId: {
        type: String,
        required: true,
    },
    participants: [],
    ticketNumber: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
});

const Conversation = mongoose.model('Conversation', ConversationSchema);
export default Conversation;