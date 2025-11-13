const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const { format } = require('date-fns');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const SENDER_NAME = "Diabit Bot";

const resend = new Resend(process.env.RESEND_API_KEY);

const PROD_SENDER_EMAIL = "onboarding@resend.dev";
const LOCAL_SENDER_EMAIL = process.env.EMAIL_USER;

const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
        user: LOCAL_SENDER_EMAIL, // Your Gmail
        pass: process.env.EMAIL_PASS, // Your Gmail App Password
    },
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false,
    }
});

const sendUnifiedEmail = async ({ to, subject, html, attachments = [] }) => {
    try {
        if (IS_PRODUCTION) {
            // --- PRODUCTION (Resend) ---
            console.log(`🚀 Sending via Resend to ${to}`);

            // Convert attachments for Resend (which expects { filename, content })
            const resendAttachments = attachments.map(att => ({
                filename: att.filename,
                content: att.content // The buffer is passed directly
            }));

            const data = await resend.emails.send({
                from: PROD_SENDER_EMAIL, // e.g., onboarding@resend.dev
                to: to,
                subject: subject,
                html: html,
                attachments: resendAttachments
            });
            return data;

        } else {
            // --- LOCALHOST (Nodemailer) ---
            console.log(`💻 Sending via Nodemailer to ${to}`);

            // Nodemailer uses the 'attachments' array as-is (with contentType)
            const data = await transporter.sendMail({
                from: `"${SENDER_NAME}" <${LOCAL_SENDER_EMAIL}>`, // e.g., "Diabit Bot" <user@gmail.com>
                to: to,
                subject: subject,
                html: html,
                attachments: attachments // Pass original array
            });
            return data;
        }
    } catch (error) {
        // Log the service that failed
        const service = IS_PRODUCTION ? 'Resend' : 'Nodemailer';
        console.error(`Error sending email via ${service} to ${to}:`, error);
        throw error; // Re-throw so the caller knows it failed
    }
};

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


const sendReminderEmail = async (user, reminder) => {
    if (!user.notifications.emailNotifications) {
        console.log(`Skipping email for ${user.email} (notifications disabled).`);
        return;
    }
    const { subject, html } = getReminderMessage(user, reminder);

    try {
        await sendUnifiedEmail({ to: user.email, subject, html });
        console.log(`Email sent to ${user.email} for reminder "${reminder.title}"`);
    } catch (error) {
        // The error is already logged by sendUnifiedEmail
    }
};


const sendOtpEmail = async (user, otp) => {
    try {
        await sendUnifiedEmail({
            to: user.email,
            subject: 'Password Reset OTP',
            html: `<h1>Hi ${user.name},</h1><p>Your OTP for password reset is: <strong>${otp}</strong>. It expires in 10 minutes.</p><p>If you didn't request this, ignore this email.</p>`,
        });
        console.log(`OTP email sent to ${user.email}`);
    } catch (error) {
        // Re-throw so the auth controller knows it failed
        throw new Error('Failed to send OTP email');
    }
};


const sendMedicationEmail = async (user, medication, triggeredTime) => {
    if (!user.notifications.emailNotifications) {
        console.log(`Skipping medication email for ${user.email} (notifications disabled).`);
        return;
    }

    try {
        await sendUnifiedEmail({
            to: user.email,
            subject: `Medication Reminder: ${medication.name}`,
            html: `<h1>Hi ${user.name},</h1>
           <p>It's time to take your medication: <strong>${medication.name} (${medication.dosage})</strong>.</p>
           <p>This dose is scheduled for <strong>${triggeredTime}</strong> your time.</p>
           <p>Please don’t forget your dose!</p>`,
        });
        console.log(`Medication email sent to ${user.email} for "${medication.name}"`);
    } catch (error) {
        // The error is already logged by sendUnifiedEmail
    }
};

const sendReportEmail = async (user, report, pdfBuffer) => {
    try {
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
                    contentType: 'application/pdf', // Nodemailer needs this, Resend will ignore it
                },
            ],
        });
        console.log(`Report email sent to ${user.email}`);
    } catch (error) {
        // The error is already logged by sendUnifiedEmail
    }
};


module.exports = { sendReminderEmail, sendOtpEmail, sendMedicationEmail, sendReportEmail }