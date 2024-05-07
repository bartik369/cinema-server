import mongoose from "mongoose";
const { Schema } = mongoose;

const ConversationMediaSchema = new Schema({
    file: {
        type: String,
        unique: false,
        required: false,
        default: "",
    },
    userId: {
        type: String,
        unique: false,
        required: false,
        default: "",
    },
    conversationId: {
        type: String,
        unique: false,
        required: true,
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

const ConversationMedia = mongoose.model('ConversationMedia', ConversationMediaSchema);
export default ConversationMedia;