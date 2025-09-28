const { format } = require('date-fns');

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
