const cron = require('node-cron');
// We still need these functions
const { format, utcToZonedTime } = require('date-fns-tz');
const Medication = require('../models/Medication');
const { sendMedicationEmail } = require('../services/email.service');

// --- CHANGE #1: Define the hardcoded timezone ---
// We assume ALL users are in Indian Standard Time (IST).
const HARDCODED_TIMEZONE = 'Asia/Kolkata';

/**
 * This function checks if a medication time (e.g., "15:22") matches
 * the current time *in the hardcoded timezone*.
 */
// --- CHANGE #2: The userTimezone argument is no longer needed ---
function isTimeForMedication(medicationTimes) {
    // Get the current time *in our hardcoded timezone*
    const nowInUserTz = utcToZonedTime(new Date(), HARDCODED_TIMEZONE);

    // Format the current time to "HH:mm"
    const currentTime = format(nowInUserTz, 'HH:mm', {
        timeZone: HARDCODED_TIMEZONE,
    });

    // Check if any of the medication times match the current time
    // e.g., at 15:22, this checks: ["15:22"].includes("15:22")
    return medicationTimes.includes(currentTime);
}

const checkMedicationReminders = async () => {
    const medications = await Medication.find({
        isNotification: true,
        frequency: { $ne: 'As Needed' },
    }).populate('user');

    if (medications.length > 0) {
        // console.log(`[MedJob] Checking ${medications.length} active medication reminders.`); // Removed
    }

    for (const med of medications) {
        // console.log(`[MedJob] Processing med: ${med.name}`); // Removed

        if (!med.user || !med.user.notifications.emailNotifications) {
            // console.log(`[MedJob] SKIPPING: User ${med.user.email} has notifications disabled.`); // Removed
            continue;
        }

        // --- CHANGE #3: We no longer get timezone from the user. ---
        // We just check the time using our hardcoded value.
        if (isTimeForMedication(med.times)) {
            // console.log(`[MedJob] SENDING reminder for "${med.name}" to ${med.user.email}`); // Removed

            // 3. Send the email
            // We must also use the hardcoded timezone here for the email text.
            const nowInUserTz = utcToZonedTime(new Date(), HARDCODED_TIMEZONE);
            const currentTime = format(nowInUserTz, 'HH:mm', {
                timeZone: HARDCODED_TIMEZONE,
            });

            await sendMedicationEmail(med.user, med, currentTime);
        } else {
            // Removed logging block
        }
    }
};

const startMedicationJob = () => {
    // Runs every minute
    cron.schedule('* * * * *', () => {
        // console.log(`\n--- Running Medication Reminder Job ---`); // Removed
        checkMedicationReminders();
    });
    console.log("Medication reminder job scheduled to run every minute.");
};

module.exports = { startMedicationJob };