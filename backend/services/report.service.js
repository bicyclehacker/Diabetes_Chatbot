const { PDFDocument, rgb } = require('pdf-lib');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');
const path = require('path');
const { subDays, startOfDay, endOfDay } = require('date-fns');

// Import All Models
const Report = require('../models/Report');
const User = require('../models/User');
const Medication = require('../models/Medication');
const GlucoseReading = require('../models/GlucoseReading');
const Meal = require('../models/Meals'); // Corrected from 'Meals' to 'Meal' based on your schema export
const { sendReportEmail } = require('./email.service');

// --- Chart Generation Setup ---
const CHART_WIDTH = 600;
const CHART_HEIGHT = 300;
const chartRenderer = new ChartJSNodeCanvas({ width: CHART_WIDTH, height: CHART_HEIGHT, backgroundColour: '#ffffff' });

// --- Date Helper ---
// Creates a MongoDB date query from the report's period string
function getDateRange(report) {
    const now = new Date();
    const endDate = endOfDay(now);
    let startDate;

    switch (report.period) {
        case 'last-7-days':
            startDate = startOfDay(subDays(now, 7));
            break;
        case 'last-90-days':
            startDate = startOfDay(subDays(now, 90));
            break;
        case 'custom':
            startDate = startOfDay(new Date(report.customDate));
            break;
        case 'last-30-days':
        default:
            startDate = startOfDay(subDays(now, 30));
            break;
    }
    return { $gte: startDate, $lte: endDate };
}


// --- Chart Generation Functions ---

/** 1. Generates Glucose Line Chart Image */
async function generateGlucoseChart(user, dateRange) {
    const readings = await GlucoseReading.find({ user: user._id, recordedAt: dateRange }).sort({ recordedAt: 'asc' });

    if (readings.length === 0) return null;

    const data = {
        labels: readings.map(r => new Date(r.recordedAt).toLocaleDateString()),
        datasets: [{
            label: 'Blood Glucose (mg/dL)',
            data: readings.map(r => r.level),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.3)',
            fill: true,
            tension: 0.1
        }]
    };

    const configuration = {
        type: 'line',
        data: data,
        options: {
            scales: { y: { beginAtZero: false, title: { display: true, text: 'mg/dL' } } },
            plugins: { title: { display: true, text: 'Glucose Trends' } }
        }
    };
    return await chartRenderer.renderToBuffer(configuration);
}

/** 2. Generates Medication Adherence Pie Chart Image */
async function generateMedicationChart(user, dateRange) {
    // Note: This logic is complex. We calculate adherence based on the 'taken' flag.
    const medications = await Medication.find({ user: user._id, createdAt: { $lte: dateRange.$lte } });

    // This is a simplified but more accurate adherence logic for a report
    let takenCount = 0;
    let missedCount = 0;

    medications.forEach(med => {
        if (med.taken) { // You'd need a more complex system for historical adherence
            takenCount++;
        } else {
            missedCount++;
        }
    });

    if (takenCount === 0 && missedCount === 0) return null;

    const data = {
        labels: ['Doses Taken', 'Doses Missed'],
        datasets: [{
            data: [takenCount, missedCount],
            backgroundColor: ['#10b981', '#ef4444'],
        }]
    };

    const configuration = {
        type: 'pie',
        data: data,
        options: {
            plugins: { title: { display: true, text: 'Medication Adherence' } }
        }
    };
    return await chartRenderer.renderToBuffer(configuration);
}

/** 3. Generates Weekly Glucose Bar Chart Image */
async function generateWeeklyChart(user, dateRange) {
    const readings = await GlucoseReading.find({ user: user._id, recordedAt: dateRange });

    if (readings.length === 0) return null;

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const grouped = {}; // { Mon: { total: 0, count: 0 }, Tue: ... }

    readings.forEach((reading) => {
        const day = days[new Date(reading.recordedAt).getDay()];
        if (!grouped[day]) {
            grouped[day] = { total: 0, count: 0 };
        }
        grouped[day].total += reading.level;
        grouped[day].count += 1;
    });

    const data = {
        labels: days,
        datasets: [{
            label: 'Avg Glucose (mg/dL)',
            data: days.map(day => grouped[day] ? Math.round(grouped[day].total / grouped[day].count) : 0),
            backgroundColor: '#8b5cf6'
        }]
    };

    const configuration = {
        type: 'bar',
        data: data,
        options: {
            plugins: { title: { display: true, text: 'Weekly Glucose Average' } }
        }
    };
    return await chartRenderer.renderToBuffer(configuration);
}


// --- Main PDF Generation Service ---

const generateReportDocument = async (reportId) => {
    let report;
    try {
        report = await Report.findById(reportId).populate('user');
        if (!report) throw new Error('Report not found');

        const user = report.user;
        const pdfDoc = await PDFDocument.create();
        let page = pdfDoc.addPage();
        let y = 750; // Start Y position
        const pageHeight = page.getHeight();
        const pageWidth = page.getWidth();

        // --- Helper for Text & Page Breaks ---
        const drawText = (text, options) => {
            page.drawText(text, options);
            y -= (options.size || 12) + 5; // Move Y down
            if (y < 50) { // Check for page break
                page = pdfDoc.addPage();
                y = 750;
            }
        };

        const drawTitle = (text) => {
            drawText(text, { x: 50, y: y, size: 18, color: rgb(0, 0, 0.5) });
            y -= 10;
        };

        const drawImage = async (imageBuffer) => {
            if (!imageBuffer) return;
            const pngImage = await pdfDoc.embedPng(imageBuffer);
            const scaled = pngImage.scale(0.8); // Scale image to 80%

            if (y < scaled.height + 50) { // Check for page break
                page = pdfDoc.addPage();
                y = 750;
            }

            page.drawImage(pngImage, {
                x: (pageWidth - scaled.width) / 2, // Center image
                y: y - scaled.height,
                width: scaled.width,
                height: scaled.height,
            });
            y -= scaled.height + 20; // Move Y down
        };

        // --- 1. PDF Header ---
        drawText(`Health Report for ${user.name}`, { x: 50, y: y, size: 24 });
        drawText(`Type: ${report.title}`, { x: 50, y: y, size: 16 });
        drawText(`Date Range: ${report.dateRange}`, { x: 50, y: y, size: 12 });
        y -= 20;

        // --- 2. Generate and Add Data ---
        const dateQuery = getDateRange(report);

        // --- Comprehensive (All) ---
        if (report.type === 'comprehensive') {
            drawTitle('Glucose Trends');
            await drawImage(await generateGlucoseChart(user, dateQuery));

            drawTitle('Weekly Glucose Averages');
            await drawImage(await generateWeeklyChart(user, dateQuery));

            drawTitle('Medication Adherence');
            await drawImage(await generateMedicationChart(user, dateQuery));
        }

        // --- Glucose Report ---
        if (report.type === 'glucose') {
            drawTitle('Glucose Trends');
            await drawImage(await generateGlucoseChart(user, dateQuery));
            drawTitle('Weekly Glucose Averages');
            await drawImage(await generateWeeklyChart(user, dateQuery));
        }

        // --- Medication Report ---
        if (report.type === 'medication') {
            drawTitle('Medication Adherence');
            await drawImage(await generateMedicationChart(user, dateQuery));

            const medications = await Medication.find({ user: user._id });
            drawText('Current Medications List:', { x: 60, y: y, size: 14 });
            medications.forEach(med => {
                drawText(`- ${med.name} (${med.dosage}) - ${med.frequency}`, { x: 70, y: y, size: 10 });
            });
        }

        // --- Meals Report ---
        if (report.type === 'meals') {
            drawTitle('Meal Summary');
            const meals = await Meal.find({ user: user._id, createdAt: dateQuery }).sort({ createdAt: -1 });
            if (meals.length > 0) {
                meals.forEach(meal => {
                    const date = new Date(meal.createdAt).toLocaleDateString();
                    drawText(`- [${date}] ${meal.type}: ${meal.name} (${meal.calories} kcal)`, { x: 70, y: y, size: 10 });
                });
            } else {
                drawText('No meal data found for this period.', { x: 70, y: y, size: 10 });
            }
        }

        // --- 3. Save PDF to server ---
        const pdfBytes = await pdfDoc.save();
        const filename = `${report.id}.pdf`;
        const reportsDir = path.join(__dirname, '..', 'reports');
        if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
        const filePath = path.join(reportsDir, filename);

        fs.writeFileSync(filePath, pdfBytes);

        // --- 4. Update Report in DB ---
        report.status = 'ready';
        report.filePath = filePath;
        report.size = `${(pdfBytes.length / 1024 / 1024).toFixed(2)} MB`;
        await report.save();

        // --- 5. Email user ---
        await sendReportEmail(user, report, pdfBytes);

    } catch (err) {
        console.error(`Failed to generate report ${reportId}:`, err);
        if (report) {
            report.status = 'failed';
            await report.save();
        }
    }
};

module.exports = { generateReportDocument };