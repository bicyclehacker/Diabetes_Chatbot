const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
    try {
        const { chatId, role, content } = req.body;

        const count = await Message.countDocuments({ chatId });

        const newMessage = new Message({
            userId: req.userId,
            chatId,
            role,
            content,
            sequence: count + 1,
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to send message' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { chatId } = req.query;

        const messages = await Message.find({ chatId }).sort({ sequence: 1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to fetch messages' });
    }
};
