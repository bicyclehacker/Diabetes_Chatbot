const express = require('express')
const multer = require('multer')
const router = express.Router()


const prescriptionController = require('../controllers/prescriptionController')
const protect = require('../middleware/authMiddleware');

const upload = multer({
    limits: { fileSize: 10 * 1024 * 1024 }, // limit to 10MB
    storage: multer.memoryStorage(), // store in memory for now
});

router.post('/', protect, upload.single('file'), prescriptionController.uploadPrescription)

module.exports = router;
