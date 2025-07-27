const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
        },
        sequence: { type: Number, required: true },
        role: { type: String, enum: ['user', 'bot'], required: true },
        content: { type: String, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
