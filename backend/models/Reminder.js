const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    type: {
        type: String,
        enum: ['Medication', 'Glucose Check', 'Meal', 'Appointment', 'Custom'],
        required: true,
    },
    time: { type: String, required: true }, // e.g., "09:00 AM"
    frequency: {
        type: String,
        enum: ['Daily', 'Weekly', 'Monthly', 'Custom'],
        required: true,
    },
    description: { type: String },

    enabled: { type: Boolean, default: true },
    nextDue: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Reminder', reminderSchema);
