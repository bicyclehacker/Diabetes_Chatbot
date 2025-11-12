const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    type: {
        type: String,
        enum: ['glucose', 'medication', 'meals', 'comprehensive'],
        required: true,
    },
    dateRange: { type: String, required: true },
    status: {
        type: String,
        enum: ['generating', 'ready', 'failed'],
        default: 'generating',
    },
    size: { type: String },
    filePath: { type: String }, // Path where the PDF is stored on the server
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', reportSchema);