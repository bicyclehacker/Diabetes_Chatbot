const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getUser);
router.put('/me', protect, authController.updateUser);
router.delete('/delete', protect, authController.deleteAccount);

// NEW: Forgot password routes (no protect middleware, as unauthenticated)
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);

module.exports = router;