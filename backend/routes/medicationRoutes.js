const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, medicationController.createMedication);
router.get('/', protect, medicationController.getMedications);
router.put('/:id', protect, medicationController.updateMedication);
router.delete('/:id', protect, medicationController.deleteMedication);

module.exports = router;
