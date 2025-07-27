const Chat = require('../models/Chat');

exports.createChat = async (req, res) => {
    try {
        const { title } = req.body;
        const newChat = new Chat({ userId: req.userId, title });
        await newChat.save();
        res.status(201).json(newChat);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to create chat' });
    }
};

exports.getChats = async (req, res) => {
    try {
        const chats = await Chat.find({ userId: req.userId }).sort({
            updatedAt: -1,
        });
        res.status(200).json(chats);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to fetch chats' });
    }
};
