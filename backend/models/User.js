const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        age: Number,
        gender: String,
        health_conditions: [String],
        preferences: {
            diet: String,
            exercise_level: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
