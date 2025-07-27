const Medication = require('../models/Medication');

exports.createMedication = async (req, res) => {
    try {
        const medication = await Medication.create({
            ...req.body,
            user: req.user.id,
        });
        res.status(201).json(medication);
    } catch (err) {
        res.status(500).json({
            message: 'Failed to create medication',
            error: err.message,
        });
    }
};

exports.getMedications = async (req, res) => {
    try {
        const medications = await Medication.find({ user: req.user.id }).sort({
            createdAt: -1,
        });
        res.status(200).json(medications);
    } catch (err) {
        res.status(500).json({
            message: 'Failed to fetch medications',
            error: err.message,
        });
    }
};

exports.updateMedication = async (req, res) => {
    try {
        const medication = await Medication.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true }
        );
        if (!medication)
            return res.status(404).json({ message: 'Medication not found' });
        res.json(medication);
    } catch (err) {
        res.status(500).json({
            message: 'Failed to update medication',
            error: err.message,
        });
    }
};

exports.deleteMedication = async (req, res) => {
    try {
        const medication = await Medication.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id,
        });
        if (!medication)
            return res.status(404).json({ message: 'Medication not found' });
        res.json({ message: 'Medication deleted' });
    } catch (err) {
        res.status(500).json({
            message: 'Failed to delete medication',
            error: err.message,
        });
    }
};
