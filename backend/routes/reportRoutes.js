const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const protect = require('../middleware/authMiddleware');

router.get('/', protect, reportController.getReports)
router.post('/generate', protect, reportController.generateReport)
router.get('/download/:id', protect, reportController.downloadReport)
router.delete('/:id', protect, reportController.deleteReport)

module.exports = router;
