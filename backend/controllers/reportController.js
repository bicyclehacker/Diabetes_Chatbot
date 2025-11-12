const Report = require('../models/Report');
const { generateReportDocument } = require('../services/report.service');
const path = require('path');
const fs = require('fs')

// @desc    Get all reports for the logged-in user
// @route   GET /api/reports
exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find({ user: req.user.id })
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Request a new report to be generated
// @route   POST /api/reports/generate
exports.generateReport = async (req, res) => {
    try {
        const { type, period, dateRangeText } = req.body;

        // Create the title based on type
        const titleMap = {
            comprehensive: "Comprehensive Report",
            glucose: "Glucose Trends Report",
            medication: "Medication Adherence Report",
            meals: "Nutrition Summary",
        };
        const title = titleMap[type] || "Health Report";

        // 1. Create Report in DB with "generating" status
        const newReport = new Report({
            user: req.user.id,
            title: title,
            type: type,
            dateRange: dateRangeText, // e.g., "Last 30 Days"
            status: 'generating',
        });

        await newReport.save();

        // 2. Start the background job (DO NOT await this)
        generateReportDocument(newReport._id);

        // 3. Immediately return the "generating" report to the frontend
        res.status(202).json(newReport);

    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Download a finished report
// @route   GET /api/reports/download/:id
exports.downloadReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        // Security check: user must own this report
        if (report.user.toString() !== req.user.id) {
            return res.status(401).json({ error: 'Not authorized' });
        }
        if (report.status !== 'ready') {
            return res.status(400).json({ error: 'Report is not ready' });
        }
        if (!report.filePath) {
            return res.status(500).json({ error: 'File path missing' });
        }

        // Send the file for download
        res.download(report.filePath, `${report.title}.pdf`);

    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Delete a report
// @route   DELETE /api/reports/:id
exports.deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Security check: user must own this report
        if (report.user.toString() !== req.user.id) {
            return res.status(401).json({ error: 'Not authorized' });
        }

        // --- Important: Clean up the physical file ---
        if (report.filePath) {
            try {
                // Check if file exists before trying to delete
                if (fs.existsSync(report.filePath)) {
                    fs.unlinkSync(report.filePath);
                    console.log(`Deleted file: ${report.filePath}`);
                }
            } catch (err) {
                // Log the error, but don't block the DB delete
                console.error(`Failed to delete file ${report.filePath}:`, err);
            }
        }
        // --- End of file cleanup ---

        // Now, delete the report from the database
        await Report.findByIdAndDelete(req.params.id);

        res.json({ message: 'Report deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};