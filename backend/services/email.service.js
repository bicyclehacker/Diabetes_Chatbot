const nodemailer = require('nodemailer');
const { format } = require('date-fns');

// --- Configuration ---
// Check if we are on Render (Production) or Localhost
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// The Name displayed in the inbox
const SENDER_NAME = "Diabit Bot";

// -----------------------------------------------------------------------------
// 1. PRODUCTION SENDER (Brevo HTTP API)
// Uses Port 443. Never blocked by firewalls.
// -----------------------------------------------------------------------------
async function sendViaBrevoApi({ to, subject, html, attachments }) {
    const url = 'https://api.brevo.com/v3/smtp/email';

    // Prepare attachments: Brevo API expects Base64 strings
    let apiAttachments = [];
    if (attachments && attachments.length > 0) {
        apiAttachments = attachments.map(att => ({
            name: att.filename,
            content: att.content.toString('base64') // Convert Buffer to Base64
        }));
    }

    const body = {
        sender: { name: SENDER_NAME, email: process.env.EMAIL_USER }, // Must be your verified Brevo email
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
        attachment: apiAttachments.length > 0 ? apiAttachments : undefined
    };

    // Native Fetch (Node.js 18+)
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY, // API Key from Brevo Dashboard
            'content-type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Brevo API Error: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
}

// -----------------------------------------------------------------------------
// 2. DEVELOPMENT SENDER (Nodemailer + Gmail)
// Free and easy for localhost testing.
// -----------------------------------------------------------------------------
async function sendViaNodemailer({ to, subject, html, attachments }) {
    const transporter = nodemailer.createTransport({
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

    await transporter.sendMail({
        from: `"${SENDER_NAME}" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
        attachments // Nodemailer handles Buffers automatically
    });
}

// -----------------------------------------------------------------------------
// 3. UNIFIED WRAPPER
// Decides which method to use based on NODE_ENV
// -----------------------------------------------------------------------------
async function sendUnifiedEmail({ to, subject, html, attachments = [] }) {
    try {
        if (IS_PRODUCTION) {
            console.log(`🚀 Production: Sending via Brevo API to ${to}`);
            await sendViaBrevoApi({ to, subject, html, attachments });
        } else {
            console.log(`💻 Development: Sending via Gmail to ${to}`);
            await sendViaNodemailer({ to, subject, html, attachments });
        }
        console.log(`✅ Email successfully sent to ${to}`);
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error.message);
        // We re-throw the error so the controller knows something went wrong (optional)
        // throw error; 
    }
}

// -----------------------------------------------------------------------------
// 4. MESSAGE TEMPLATES
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// 5. EXPORTED FUNCTIONS
// -----------------------------------------------------------------------------

const sendReminderEmail = async (user, reminder) => {
    if (!user.notifications?.emailNotifications) {
        console.log(`Skipping email for ${user.email} (notifications disabled).`);
        return;
    }

    const { subject, html } = getReminderMessage(user, reminder);
    await sendUnifiedEmail({ to: user.email, subject, html });
};

const sendOtpEmail = async (user, otp) => {
    try {
        await sendUnifiedEmail({
            to: user.email,
            subject: 'Password Reset OTP',
            html: `<h1>Hi ${user.name},</h1><p>Your OTP for password reset is: <strong>${otp}</strong>. It expires in 10 minutes.</p><p>If you didn't request this, ignore this email.</p>`,
        });
    } catch (error) {
        console.error(`Error sending OTP email to ${user.email}:`, error);
        throw new Error('Failed to send OTP email');
    }
};

const sendMedicationEmail = async (user, medication, triggeredTime) => {
    if (!user.notifications?.emailNotifications) {
        console.log(`Skipping medication email for ${user.email} (notifications disabled).`);
        return;
    }

    await sendUnifiedEmail({
        to: user.email,
        subject: `Medication Reminder: ${medication.name}`,
        html: `<h1>Hi ${user.name},</h1>
        <p>It's time to take your medication: <strong>${medication.name} (${medication.dosage})</strong>.</p>
        <p>This dose is scheduled for <strong>${triggeredTime}</strong> your time.</p>
        <p>Please don’t forget your dose!</p>`,
    });
};

const sendReportEmail = async (user, report, pdfBuffer) => {
    await sendUnifiedEmail({
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
    });
};

module.exports = { sendReminderEmail, sendOtpEmail, sendMedicationEmail, sendReportEmail };