const nodemailer = require('nodemailer')
const { format } = require('date-fns');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendReminderEmail = async (user, reminder) => {
    if (!user.notifications.emailNotifications) {
        console.log(`Skipping email for ${user.email} (notifications disabled).`);
        return;
    }

    const mailOptions = {
        from: `"Diabit Bot" <${process.env.EMIAL_USER}>`,
        to: user.email,
        subject: `Reminder: ${reminder.title}`,
        html: `<h1>Hi ${user.name},</h1><p>This is a reminder for: <strong>${reminder.title}</strong> at ${format(new Date(reminder.date), "p, EEEE, MMMM d")}.</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${user.email} for reminder "${reminder.title}"`);
    } catch (error) {
        console.error(`Error sending email to ${user.email}:`, error);
    }
}

module.exports = { sendReminderEmail }