const nodemailer = require('nodemailer');
const { format } = require('date-fns');

// --- Configuration & Transporter Setup ---

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const SENDER_NAME = "Diabit Bot";

let transporter;
let senderEmail;

if (IS_PRODUCTION) {
    // ---------------------------------------------------------
    // PRODUCTION: Use Brevo (Sendinblue)
    // ---------------------------------------------------------
    // This prevents "Connection Timeout" errors on Render.
    // Ensure 'EMAIL_USER' is your Brevo login email.
    // Ensure 'EMAIL_PASS' is your Brevo SMTP Key (NOT your login password).

    console.log("🚀 Environment: Production (Using Brevo/Sendinblue)");

    senderEmail = process.env.EMAIL_USER;

    transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false, // Use STARTTLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false
        }
    });

} else {
    // ---------------------------------------------------------
    // LOCALHOST: Use Gmail
    // ---------------------------------------------------------
    // This is free and easy for local testing.
    // Ensure 'GMAIL_USER' is your Gmail address.
    // Ensure 'GMAIL_PASS' is your Google App Password.

    console.log("💻 Environment: Development (Using Gmail)");

    senderEmail = process.env.GMAIL_USER;

    transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: false,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
        tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false
        }
    });
}

// --- Helper: Message Generator ---

function getReminderMessage(user, reminder) {
    const formattedDate = format(new Date(reminder.date), "p, EEEE, MMMM d");

    switch (reminder.type) {
        case 'medication':
            return {
                subject: `Medication Reminder: ${reminder.title}`,
                html: `<h1>Hi ${user.name},</h1>
                <p>It's time to take your medication: <strong>${reminder.title}</strong>.</p>
                <p>Scheduled at: <strong>${formattedDate}</strong>.</p>
                <p>Please don’t forget your dose!</p>`
            };

        case 'glucose':
            return {
                subject: `Glucose Check Reminder`,
                html: `<h1>Hi ${user.name},</h1>
                <p>This is a reminder to check your <strong>blood glucose levels</strong>.</p>
                <p>Scheduled at: <strong>${formattedDate}</strong>.</p>
                <p>Stay healthy 💙</p>`
            };

        case 'meal':
            return {
                subject: `Meal Reminder: ${reminder.title}`,
                html: `<h1>Hi ${user.name},</h1>
                <p>It's time for your meal: <strong>${reminder.title}</strong>.</p>
                <p>Scheduled at: <strong>${formattedDate}</strong>.</p>`
            };

        case 'appointment':
            return {
                subject: `Upcoming Appointment: ${reminder.title}`,
                html: `<h1>Hi ${user.name},</h1>
                <p>You have an appointment: <strong>${reminder.title}</strong>.</p>
                <p>When: <strong>${formattedDate}</strong>.</p>`
            };

        case 'task':
            return {
                subject: `Task Reminder: ${reminder.title}`,
                html: `<h1>Hi ${user.name},</h1>
                <p>Don't forget your task: <strong>${reminder.title}</strong>.</p>
                <p>Deadline: <strong>${formattedDate}</strong>.</p>`
            };

        case 'reminder':
        default:
            return {
                subject: `Reminder: ${reminder.title}`,
                html: `<h1>Hi ${user.name},</h1>
                <p>This is a reminder for: <strong>${reminder.title}</strong>.</p>
                <p>Scheduled at: <strong>${formattedDate}</strong>.</p>`
            };
    }
}

// --- Sending Functions ---

const sendReminderEmail = async (user, reminder) => {
    // Check user preferences
    if (!user.notifications || !user.notifications.emailNotifications) {
        console.log(`Skipping email for ${user.email} (notifications disabled).`);
        return;
    }

    const { subject, html } = getReminderMessage(user, reminder);

    const mailOptions = {
        from: `"${SENDER_NAME}" <${senderEmail}>`,
        to: user.email,
        subject,
        html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${user.email} for reminder "${reminder.title}"`);
    } catch (error) {
        console.error(`Error sending email to ${user.email}:`, error);
    }
};

const sendOtpEmail = async (user, otp) => {
    const mailOptions = {
        from: `"${SENDER_NAME}" <${senderEmail}>`,
        to: user.email,
        subject: 'Password Reset OTP',
        html: `<h1>Hi ${user.name},</h1><p>Your OTP for password reset is: <strong>${otp}</strong>. It expires in 10 minutes.</p><p>If you didn't request this, ignore this email.</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${user.email}`);
    } catch (error) {
        console.error(`Error sending OTP email to ${user.email}:`, error);
        // Important: Throw error so the controller knows the request failed
        throw new Error('Failed to send OTP email');
    }
}

const sendMedicationEmail = async (user, medication, triggeredTime) => {
    if (!user.notifications || !user.notifications.emailNotifications) {
        console.log(`Skipping medication email for ${user.email} (notifications disabled).`);
        return;
    }

    const mailOptions = {
        from: `"${SENDER_NAME}" <${senderEmail}>`,
        to: user.email,
        subject: `Medication Reminder: ${medication.name}`,
        html: `<h1>Hi ${user.name},</h1>
        <p>It's time to take your medication: <strong>${medication.name} (${medication.dosage})</strong>.</p>
        <p>This dose is scheduled for <strong>${triggeredTime}</strong> your time.</p>
        <p>Please don’t forget your dose!</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Medication email sent to ${user.email} for "${medication.name}"`);
    } catch (error) {
        console.error(`Error sending medication email to ${user.email}:`, error);
    }
};

const sendReportEmail = async (user, report, pdfBuffer) => {
    const mailOptions = {
        from: `"${SENDER_NAME}" <${senderEmail}>`,
        to: user.email,
        subject: `Your Report is Ready: ${report.title}`,
        html: `<h1>Hi ${user.name},</h1>
        <p>Your health report, "${report.title}", is ready.</p>
        <p>It is attached to this email for your convenience. You can also download it from the app.</p>`,
        attachments: [
            {
                filename: `${report.title.replace(/ /g, '_')}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf',
            },
        ],
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Report email sent to ${user.email}`);
    } catch (error) {
        console.error(`Error sending report email to ${user.email}:`, error);
    }
};

module.exports = {
    sendReminderEmail,
    sendOtpEmail,
    sendMedicationEmail,
    sendReportEmail
};