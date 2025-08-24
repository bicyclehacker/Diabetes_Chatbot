const Chat = require('../models/Chat');

exports.createChat = async (req, res) => {
    try {
        const { title } = req.body;
        const newChat = new Chat({ userId: req.user.id, title });
        await newChat.save();
        res.status(201).json(newChat);
    } catch (err) {
        // res.status(500).json({ msg: 'Failed to create chat' });
        res.status(500).json({ msg: err });
    }
};

exports.getChats = async (req, res) => {
    try {
        const chats = await Chat.find({ userId: req.user.id }).sort({
            updatedAt: -1,
        });
        res.status(200).json(chats);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to fetch chats' });
    }
};

exports.renameChat = async (req, res) => {
    try {
        const { title } = req.body;
        const { id } = req.params;

        if (!title || title.trim() === "") {
            return res.status(400).json({ msg: 'Chat title is required' });
        }

        const updatedChat = await Chat.findOneAndUpdate(
            { _id: id, userId: req.user.id }, // only allow the owner to rename
            { title },
            { new: true, runValidators: true }
        );

        if (!updatedChat) {
            return res.status(404).json({ msg: 'Chat not found or unauthorized' });
        }

        res.status(200).json(updatedChat);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Failed to rename chat' });
    }
};

exports.updateChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { title } = req.body;

        // Find and update
        const updatedChat = await Chat.findOneAndUpdate(
            { _id: chatId, userId: req.user.id },
            { title },
            { new: true, runValidators: true }
        );

        if (!updatedChat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        res.status(200).json(updatedChat);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update chat', error: err.message });
    }
};

exports.deleteChat = async (req, res) => {
    try {
        const { chatId } = req.params;

        const deletedChat = await Chat.findOneAndDelete({
            _id: chatId,
            userId: req.user.id
        });

        if (!deletedChat) {
            return res.status(404).json({ msg: 'Chat not found or not authorized' });
        }

        res.status(200).json({ msg: 'Chat deleted successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Failed to delete chat', error: err.message });
    }
};
