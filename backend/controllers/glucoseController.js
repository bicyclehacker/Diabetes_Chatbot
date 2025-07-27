const GlucoseReading = require('../models/GlucoseReading');

exports.createReading = async (req, res) => {
    try {
        const reading = await GlucoseReading.create({
            ...req.body,
            user: req.user.id,
        });
        res.status(201).json(reading);
    } catch (err) {
        res.status(500).json({
            message: 'Failed to create glucose reading',
            error: err.message,
        });
    }
};

exports.getReadings = async (req, res) => {
    try {
        const readings = await GlucoseReading.find({ user: req.user.id }).sort({
            recordedAt: -1,
        });
        res.json(readings);
    } catch (err) {
        res.status(500).json({
            message: 'Failed to fetch readings',
            error: err.message,
        });
    }
};

exports.updateReading = async (req, res) => {
    try {
        const reading = await GlucoseReading.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true }
        );
        if (!reading)
            return res.status(404).json({ message: 'Reading not found' });
        res.json(reading);
    } catch (err) {
        res.status(500).json({
            message: 'Failed to update reading',
            error: err.message,
        });
    }
};

exports.deleteReading = async (req, res) => {
    try {
        const reading = await GlucoseReading.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id,
        });
        if (!reading)
            return res.status(404).json({ message: 'Reading not found' });
        res.json({ message: 'Glucose reading deleted' });
    } catch (err) {
        res.status(500).json({
            message: 'Failed to delete reading',
            error: err.message,
        });
    }
};
