const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const protect = require('../middleware/authMiddleware');

router.get('/glucose-trend', protect, dashboardController.glucoseTrend);
router.get(
    '/medication-history',
    protect,
    dashboardController.medicationHistory
);
router.get('/symptom-trend', protect, dashboardController.symptomTrend);
router.get('/activity-summary', protect, dashboardController.activitySummary);
router.get('/upcoming-reminders', protect, dashboardController.todayReminders);

module.exports = router;
