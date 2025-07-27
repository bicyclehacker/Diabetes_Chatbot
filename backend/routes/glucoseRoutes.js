const express = require('express');
const router = express.Router();
const glucoseController = require('../controllers/glucoseController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, glucoseController.createReading);
router.get('/', protect, glucoseController.getReadings);
router.put('/:id', protect, glucoseController.updateReading);
router.delete('/:id', protect, glucoseController.deleteReading);

module.exports = router;
