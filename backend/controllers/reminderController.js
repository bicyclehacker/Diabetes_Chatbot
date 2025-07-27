const Reminder = require('../models/Reminder');

exports.createReminder = async (req, res) => {
    try {
        const reminder = await Reminder.create({
            ...req.body,
            user: req.user.id,
        });
        res.status(201).json(reminder);
    } catch (err) {
        res.status(500).json({
            message: 'Failed to create reminder',
            error: err.message,
        });
    }
};

exports.getReminders = async (req, res) => {
    try {
        const reminders = await Reminder.find({ user: req.user.id }).sort({
            createdAt: -1,
        });
        res.status(200).json(reminders);
    } catch (err) {
        res.status(500).json({
            message: 'Failed to fetch reminders',
            error: err.message,
        });
    }
};

exports.updateReminder = async (req, res) => {
    try {
        const reminder = await Reminder.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true }
        );
        if (!reminder)
            return res.status(404).json({ message: 'Reminder not found' });
        res.json(reminder);
    } catch (err) {
        res.status(500).json({
            message: 'Failed to update reminder',
            error: err.message,
        });
    }
};

exports.deleteReminder = async (req, res) => {
    try {
        const reminder = await Reminder.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id,
        });
        if (!reminder)
            return res.status(404).json({ message: 'Reminder not found' });
        res.json({ message: 'Reminder deleted' });
    } catch (err) {
        res.status(500).json({
            message: 'Failed to delete reminder',
            error: err.message,
        });
    }
};
