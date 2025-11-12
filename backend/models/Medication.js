const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: {
        type: String,
        enum: ['Once Daily', 'Twice Daily', 'Three Times Daily', 'As Needed'],
        required: true,
    },
    times: { type: [String], required: true }, // e.g., ["08:00 AM", "08:00 PM"]
    notes: { type: String },
    isNotification: { type: Boolean, default: false },

    taken: { type: Boolean, default: false },
    lastTaken: { type: Date },
    createdAt: { type: Date, default: Date.now },

});

module.exports = mongoose.model('Medication', medicationSchema);
