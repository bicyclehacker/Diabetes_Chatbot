const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String }, // changed from phoneNumber
        dateOfBirth: { type: Date }, // changed from dob

        diabetesType: {
            type: String,
            enum: ['type-1', 'type-2', 'gestation', 'other'], // match your data exactly
        },

        diagnosisDate: { type: Date },

        emergencyContact: { type: String },

        preferences: {
            glucoseUnit: {
                type: String,
                enum: ['mg-dl', 'mmol-l'],
                default: 'mg-dl',
            },
            timeFormat: {
                type: String,
                enum: ['12-hour', '24-hour'],
                default: '12-hour',
            },
            language: { type: String, default: 'en' },
            theme: { type: String, enum: ['light', 'dark'], default: 'light' },
        },

        notifications: {
            medicationReminders: { type: Boolean, default: true },
            glucoseAlerts: { type: Boolean, default: true },
            appointmentReminders: { type: Boolean, default: true },
            pushNotifications: { type: Boolean, default: true },
            emailNotifications: { type: Boolean, default: true },
        },

        privacy: {
            shareDataWithDoctor: { type: Boolean, default: true },
            anonymousAnalytics: { type: Boolean, default: false },
            dataExport: { type: Boolean, default: true },
        },
        // NEW: Fields for OTP reset
        resetOtp: { type: String, select: false }, // Hashed OTP, not selected by default for security
        resetOtpExpiry: { type: Date, select: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);