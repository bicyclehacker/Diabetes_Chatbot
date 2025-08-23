const cron = require('node-cron')
const Reminder = require('../models/Reminder');
const { sendReminderEmail } = require('../services/email.service');
const { format } = require('date-fns')

const checkRemindersAndSendEmails = async () => {

    const nowUTC = new Date(new Date().toUTCString());
    const oneMinuteFromNowUTC = new Date(nowUTC.getTime() + 60 * 1000);

    const reminders = await Reminder.find({
        date: { $gte: nowUTC, $lt: oneMinuteFromNowUTC },
        emailReminder: true,
        enabled: true,
    }).populate('user');

    if (reminders.length > 0) {
        console.log(`Found ${reminders.length} reminders to send.`);
    }

    for (const reminder of reminders) {
        if (reminder.user) {
            await sendReminderEmail(reminder.user, reminder);

            if (reminder.frequency !== 'once') {
                let nextDate = new Date(reminder.date);
                if (reminder.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
                if (reminder.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
                if (reminder.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);

                await Reminder.findByIdAndUpdate(reminder._id, { date: nextDate });
                console.log(`Rescheduled "${reminder.title}" to ${nextDate}`);
            } else {
                await Reminder.findByIdAndUpdate(reminder._id, { enabled: false });
                console.log(`Disabled "once" reminder "${reminder.title}"`);
            }
        }
    }
};

const startReminderJob = () => {
    cron.schedule('* * * * *', () => {
        console.log(`\n--- Running Reminder Job at ${format(new Date(), "p, EEEE, MMMM d")} (IST) ---`);
        checkRemindersAndSendEmails();
    });
    console.log("Reminder job scheduled to run every minute.");
};

module.exports = { startReminderJob };