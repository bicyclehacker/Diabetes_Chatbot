const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phoneNumber: { type: String },
        dob: { type: Date },
        diabetesType: {
            type: String,
            enum: ['Type 1', 'Type 2', 'Gestation', 'Other'],
        },
        diagnosisDate: { type: Date },
        emergencyContact: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
