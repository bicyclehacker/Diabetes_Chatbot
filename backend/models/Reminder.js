const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Core fields
    title: { type: String, required: true },
    description: { type: String },

    // Event type
    type: {
        type: String,
        enum: ['medication', 'glucose', 'meal', 'appointment', 'task', 'reminder'],
        required: true,
        lowercase: true, // normalize values to match frontend enum
    },

    // Date & Time
    date: { type: Date, required: true }, // Full date
    time: { type: String }, // optional time (string for "09:00 AM")

    // Repetition/Frequency
    frequency: {
        type: String,
        enum: ['once', 'daily', 'weekly', 'monthly'],
        default: 'once',
    },

    // Flags
    isTask: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
    emailReminder: { type: Boolean, default: false },
    enabled: { type: Boolean, default: true },

    // Extra fields
    value: { type: String }, // optional, for storing any additional event info
    nextDue: { type: Date },

    createdAt: { type: Date, default: Date.now },
});


reminderSchema.pre('save', function (next) {
    if (!this.date) return next();

    let nextDate = new Date(this.date);

    switch (this.frequency) {
        case 'Daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        case 'Weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case 'Monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        case 'Once':
        default:
            nextDate = null; // no repeat
    }

    this.nextDue = nextDate;
    next();
});


module.exports = mongoose.model('Reminder', reminderSchema);
