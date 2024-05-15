import mongoose from "mongoose";
const { Schema } = mongoose;

const MessagesSchema = new Schema({
    conversationId: {
        type: String,
        unique: false,
        required: true,
    },
    senderId: {
        type: String,
        unique: false,
        required: true,
    },
    recipientId: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: false,
    },
    mediaId: {
        type: String,
        unique: false,
        required: false,
        default: "",
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    read: {
        type: String,
        default: 'no',
    },
    replyTo: {
        type: String,
        default: "",
    }

});
const Messages = mongoose.model('Messages', MessagesSchema);
export default Messages;