const nodemailer = require('nodemailer')
const { format } = require('date-fns');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// FIXED: Typo in from email (EMIAL_USER -> EMAIL_USER)
const sendReminderEmail = async (user, reminder) => {
    if (!user.notifications.emailNotifications) {
        console.log(`Skipping email for ${user.email} (notifications disabled).`);
        return;
    }

    const mailOptions = {
        from: `"Diabit Bot" <${process.env.EMAIL_USER}>`,
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

// NEW: Function to send OTP email (always send for password reset, ignore notifications pref for security)
const sendOtpEmail = async (user, otp) => {
    const mailOptions = {
        from: `"Diabit Bot" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Password Reset OTP',
        html: `<h1>Hi ${user.name},</h1><p>Your OTP for password reset is: <strong>${otp}</strong>. It expires in 10 minutes.</p><p>If you didn't request this, ignore this email.</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${user.email}`);
    } catch (error) {
        console.error(`Error sending OTP email to ${user.email}:`, error);
        throw new Error('Failed to send OTP email');
    }
}

module.exports = { sendReminderEmail, sendOtpEmail }