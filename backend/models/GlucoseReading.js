const mongoose = require('mongoose');

const glucoseReadingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    level: { type: Number, required: true },
    readingType: {
        type: String,
        enum: ['fasting', 'before-meal', 'after-meal', 'bedtime', 'random'],
        required: true,
    },
    notes: { type: String },
    recordedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GlucoseReading', glucoseReadingSchema);
