const mongoose = require('mongoose');

const { startReminderJob } = require('../jobs/remainder.job')

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');

        startReminderJob();

    } catch (error) {
        console.error('MongoDB Connection Error', error);
        process.exit(1);
    }
};

module.exports = connectDB;
