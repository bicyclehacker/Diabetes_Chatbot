const { PDFDocument, rgb, StandardFonts } = require('pdf-lib'); // Added StandardFonts
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');
const path = require('path');
const { subDays, startOfDay, endOfDay } = require('date-fns');

// Import All Models
const Report = require('../models/Report');
const User = require('../models/User');
const Medication = require('../models/Medication');
const GlucoseReading = require('../models/GlucoseReading');
const Meal = require('../models/Meals');
const { sendReportEmail } = require('./email.service');

// --- Chart Generation Setup (Unchanged) ---
const CHART_WIDTH = 600;
const CHART_HEIGHT = 300;
const chartRenderer = new ChartJSNodeCanvas({ width: CHART_WIDTH, height: CHART_HEIGHT, backgroundColour: '#ffffff' });

// --- Date Helper (Unchanged) ---
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

// --- Chart Generation Functions (Unchanged) ---

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
    const medications = await Medication.find({ user: user._id, createdAt: { $lte: dateRange.$lte } });
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
    const grouped = {};
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


// --- 🌟 NEW: Report Generator Class ---

const COLORS = {
    primary: rgb(0.1, 0.3, 0.7), // Deep Blue
    secondary: rgb(0.2, 0.2, 0.2), // Dark Gray
    body: rgb(0.1, 0.1, 0.1), // Near Black
    gray: rgb(0.5, 0.5, 0.5),
};

const MARGIN = {
    top: 60,
    bottom: 60,
    left: 50,
    right: 50,
};

class ReportGenerator {
    constructor(report, user) {
        this.report = report;
        this.user = user;
        this.pdfDoc = null;
        this.page = null;
        this.y = 0; // Current Y position (moves from top to bottom)
        this.fonts = {};
        this.dateQuery = getDateRange(report);

        // --- 🌟 NEW ---
        // Flag to ensure the first section flows, but others get new pages.
        this.isFirstSection = true;
    }

    async init() {
        this.pdfDoc = await PDFDocument.create();
        this.fonts.regular = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
        this.fonts.bold = await this.pdfDoc.embedFont(StandardFonts.HelveticaBold);
        this.fonts.italic = await this.pdfDoc.embedFont(StandardFonts.HelveticaOblique);
        this.addPage();
    }

    addPage() {
        this.page = this.pdfDoc.addPage();
        this.y = this.page.getHeight() - MARGIN.top;

        // Add a dynamic footer to each new page
        this.page.drawText(`Page ${this.pdfDoc.getPageCount()}`, {
            x: this.page.getWidth() / 2 - 20,
            y: MARGIN.bottom / 2,
            font: this.fonts.regular,
            size: 9,
            color: COLORS.gray,
        });
    }

    /** Moves the Y-cursor down, adding a new page if needed */
    moveDown(amount) {
        this.y -= amount;
        if (this.y < MARGIN.bottom) {
            this.addPage();
            return true; // Indicates a page break
        }
        return false;
    }

    /** Draws the main report header */
    drawHeader() {
        this.page.drawText('Diabetic AI Health Report', {
            x: MARGIN.left,
            y: this.y,
            font: this.fonts.bold,
            size: 24,
            color: COLORS.primary,
        });
        this.moveDown(30);

        this.page.drawText(`Patient: ${this.user.name}`, {
            x: MARGIN.left,
            y: this.y,
            font: this.fonts.bold,
            size: 14,
            color: COLORS.secondary,
        });
        this.moveDown(20);

        this.page.drawText(`Report Title: ${this.report.title}`, {
            x: MARGIN.left,
            y: this.y,
            font: this.fonts.regular,
            size: 11,
            color: COLORS.body,
        });
        this.moveDown(15);

        this.page.drawText(`Date Range: ${this.report.dateRange}`, {
            x: MARGIN.left,
            y: this.y,
            font: this.fonts.regular,
            size: 11,
            color: COLORS.body,
        });
        this.moveDown(15);

        this.page.drawText(`Generated On: ${new Date().toLocaleString()}`, {
            x: MARGIN.left,
            y: this.y,
            font: this.fonts.regular,
            size: 11,
            color: COLORS.body,
        });
        this.moveDown(30); // Extra space after header
    }

    /** Draws a stylized section heading */
    drawSectionTitle(title) {
        // --- 🌟 MODIFIED LOGIC ---
        if (!this.isFirstSection) {
            // If this is not the first section, force a new page.
            this.addPage();
        } else {
            // It's the first section. Just add some space after the header
            // and check for orphans.
            this.moveDown(10);
            if (this.y < MARGIN.bottom + 100) this.addPage();
            this.isFirstSection = false; // Unset the flag
        }
        // --- END MODIFICATION ---

        this.page.drawText(title, {
            x: MARGIN.left,
            y: this.y,
            font: this.fonts.bold,
            size: 18,
            color: COLORS.primary,
        });
        this.moveDown(24);

        // Draw a line under the title
        this.page.drawLine({
            start: { x: MARGIN.left, y: this.y + 10 },
            end: { x: this.page.getWidth() - MARGIN.right, y: this.y + 10 },
            thickness: 1,
            color: COLORS.primary,
            opacity: 0.5,
        });
    }

    /** Draws an image, centered, and handles page breaks */
    async drawImage(imageBuffer) {
        if (!imageBuffer) {
            this.page.drawText('No data available to display chart.', {
                x: MARGIN.left,
                y: this.y,
                font: this.fonts.italic,
                size: 10,
                color: COLORS.gray,
            });
            this.moveDown(20);
            return;
        }

        const pngImage = await this.pdfDoc.embedPng(imageBuffer);
        const scaled = pngImage.scale(0.8);

        if (this.y < scaled.height + MARGIN.bottom) {
            this.addPage();
        }

        this.page.drawImage(pngImage, {
            x: (this.page.getWidth() - scaled.width) / 2,
            y: this.y - scaled.height,
            width: scaled.width,
            height: scaled.height,
        });
        this.moveDown(scaled.height + 25);
    }

    /** Draws a table with headers and rows */
    drawTable(headers, rows) {
        if (rows.length === 0) {
            this.page.drawText('No data found for this period.', {
                x: MARGIN.left,
                y: this.y,
                font: this.fonts.italic,
                size: 10,
                color: COLORS.gray,
            });
            this.moveDown(20);
            return;
        }

        const tableWidth = this.page.getWidth() - MARGIN.left - MARGIN.right;
        const colWidths = headers.map(() => tableWidth / headers.length); // Simple equal widths
        const rowHeight = 20;
        const fontSize = 10;

        // Draw Header
        headers.forEach((header, i) => {
            this.page.drawText(header, {
                x: MARGIN.left + (colWidths.slice(0, i).reduce((a, b) => a + b, 0)) + 5,
                y: this.y,
                font: this.fonts.bold,
                size: fontSize,
                color: COLORS.secondary,
            });
        });
        this.moveDown(rowHeight + 2);

        // Draw Header Line
        this.page.drawLine({
            start: { x: MARGIN.left, y: this.y + 5 },
            end: { x: this.page.getWidth() - MARGIN.right, y: this.y + 5 },
            thickness: 0.5,
            color: COLORS.secondary,
        });

        // Draw Rows
        rows.forEach(row => {
            const didPageBreak = this.moveDown(rowHeight);

            // If we broke, redraw header on new page
            if (didPageBreak) {
                headers.forEach((header, i) => {
                    this.page.drawText(header, {
                        x: MARGIN.left + (colWidths.slice(0, i).reduce((a, b) => a + b, 0)) + 5,
                        y: this.y,
                        font: this.fonts.bold,
                        size: fontSize,
                        color: COLORS.secondary,
                    });
                });
                this.moveDown(rowHeight + 2);
                this.page.drawLine({
                    start: { x: MARGIN.left, y: this.y + 5 },
                    end: { x: this.page.getWidth() - MARGIN.right, y: this.y + 5 },
                    thickness: 0.5,
                    color: COLORS.secondary,
                });
                this.moveDown(rowHeight); // Account for row just drawn
            }

            row.forEach((cell, i) => {
                this.page.drawText(String(cell || '-'), {
                    x: MARGIN.left + (colWidths.slice(0, i).reduce((a, b) => a + b, 0)) + 5,
                    y: this.y,
                    font: this.fonts.regular,
                    size: fontSize,
                    color: COLORS.body,
                });
            });
        });
        this.moveDown(30); // Space after table
    }

    /** Helper to build the glucose section */
    async buildGlucoseSection() {
        this.drawSectionTitle('Glucose Analysis');
        await this.drawImage(await generateGlucoseChart(this.user, this.dateQuery));
        await this.drawImage(await generateWeeklyChart(this.user, this.dateQuery));

        this.drawSectionTitle('Glucose Log');
        const readings = await GlucoseReading.find({ user: this.user._id, recordedAt: this.dateQuery }).sort({ recordedAt: 'desc' });
        const headers = ['Date', 'Time', 'Level (mg/dL)', 'Type'];
        const rows = readings.map(r => [
            new Date(r.recordedAt).toLocaleDateString(),
            new Date(r.recordedAt).toLocaleTimeString(),
            r.level,
            r.readingType || 'N/A'
        ]);
        this.drawTable(headers, rows);
    }

    /** Helper to build the medication section */
    async buildMedicationSection() {
        this.drawSectionTitle('Medication Analysis');
        await this.drawImage(await generateMedicationChart(this.user, this.dateQuery));

        this.drawSectionTitle('Medication List');
        const medications = await Medication.find({ user: this.user._id });
        const headers = ['Name', 'Dosage', 'Frequency', 'Notes'];
        const rows = medications.map(m => [
            m.name,
            m.dosage,
            m.frequency,
            m.notes || '-'
        ]);
        this.drawTable(headers, rows);
    }

    /** Helper to build the meals section */
    async buildMealsSection() {
        this.drawSectionTitle('Meal Analysis');

        const meals = await Meal.find({ user: this.user._id, createdAt: this.dateQuery }).sort({ createdAt: 'desc' });
        const headers = ['Date', 'Time', 'Type', 'Name', 'Calories (kcal)'];
        const rows = meals.map(m => [
            new Date(m.createdAt).toLocaleDateString(),
            new Date(m.createdAt).toLocaleTimeString(),
            m.type,
            m.name,
            m.calories
        ]);
        this.drawTable(headers, rows);
    }

    /** Main generation function */
    async generate() {
        await this.init();
        this.drawHeader();

        // --- Build Sections Based on Report Type ---
        // The page-break logic is now inside drawSectionTitle
        if (this.report.type === 'comprehensive') {
            await this.buildGlucoseSection();
            await this.buildMedicationSection();
            await this.buildMealsSection();
        }
        if (this.report.type === 'glucose') {
            await this.buildGlucoseSection();
        }
        if (this.report.type === 'medication') {
            await this.buildMedicationSection();
        }
        if (this.report.type === 'meals') {
            await this.buildMealsSection();
        }

        // --- Save PDF ---
        const pdfBytes = await this.pdfDoc.save();
        return pdfBytes;
    }
}

// --- 🌟 REFACTORED: Main PDF Generation Service ---

const generateReportDocument = async (reportId) => {
    let report;
    try {
        report = await Report.findById(reportId).populate('user');
        if (!report) throw new Error('Report not found');
        if (!report.user) throw new Error('User not found for report');

        const user = report.user;

        // --- 1. Use the new Generator Class ---
        const generator = new ReportGenerator(report, user);
        const pdfBytes = await generator.generate();

        // --- 2. Save PDF to server ---
        const filename = `${report.id}.pdf`;
        const reportsDir = path.join(__dirname, '..', 'reports');
        if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
        const filePath = path.join(reportsDir, filename);

        fs.writeFileSync(filePath, pdfBytes);

        // --- 3. Update Report in DB ---
        report.status = 'ready';
        report.filePath = filePath;
        report.size = `${(pdfBytes.length / 1024).toFixed(2)} KB`; // Size in KB is more reasonable
        await report.save();

        // --- 4. Email user ---
        await sendReportEmail(user, report, pdfBytes);

        console.log(`Successfully generated report ${reportId} for ${user.name}`);

    } catch (err) {
        console.error(`Failed to generate report ${reportId}:`, err);
        if (report) {
            report.status = 'failed';
            await report.save();
        }
    }
};

module.exports = { generateReportDocument };