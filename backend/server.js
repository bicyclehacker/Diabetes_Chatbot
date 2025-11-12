const express = require('express');

const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes.js');

const reminderRoutes = require('./routes/reminderRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const mealRoutes = require('./routes/mealRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const glucoseRoutes = require('./routes/glucoseRoutes');
const prescriptionRoutes = require('./routes/prescritionRoutes');
const reportRoutes = require('./routes/reportRoutes')

const cors = require('cors');

connectDB();

const app = express();
app.use(
    cors({
        origin: '*', // allow only your frontend
        credentials: true, // allow cookies if needed later
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }))



app.use('/api/prescription', prescriptionRoutes);

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

app.use('/api/reminders', reminderRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/glucose', glucoseRoutes);
app.use('/api/reports', reportRoutes)



// // Run the reminder job every minute
// cron.schedule('* * * * *', () => {
//     sendDueReminders().catch(console.error);
// });


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
