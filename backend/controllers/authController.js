const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const GlucoseReading = require('../models/GlucoseReading');
const Medication = require('../models/Medication');
const Meals = require('../models/Meals');
const Reminder = require('../models/Reminder');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { sendOtpEmail } = require('../services/email.service');

// Register
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ msg: 'All required fields must be filled' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
        });

        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        res.status(201).json({ token, user });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });
        res.status(200).json({ token, user });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};


// Get user
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
};

//Update User
// exports.updateUser = async (req, res) => {
//     try {
//         const updates = req.body;
//         const userId = req.user.id;

//         const updatedUser = await User.findByIdAndUpdate(userId, updates, {
//             new: true,
//         }).select('-password');

//         res.status(200).json(updatedUser);
//     } catch (error) {
//         res.status(500).json({ msg: 'Failed to update user', error });
//     }
// };

// controllers/authController.js (or whichever file has updateUser)
exports.updateUser = async (req, res) => {
    try {
        const updates = req.body || {};
        const userId = req.user.id;

        // allowed top-level fields to be updated
        const allowed = [
            'name', 'email', 'phone', 'dateOfBirth', 'diabetesType', 'diagnosisDate',
            'emergencyContact', 'preferences', 'notifications', 'privacy'
        ];

        // Build $set object for mongoose
        const setObj = {};
        for (const key of Object.keys(updates)) {
            if (allowed.includes(key) || key.includes('.')) {
                setObj[key] = updates[key];
            }
        }

        if (Object.keys(setObj).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: setObj },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update user', error: err.message });
    }
};

//Delete User
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;

        await Promise.all([
            User.findByIdAndDelete(userId),
            GlucoseReading.deleteMany({ user: userId }),
            Medication.deleteMany({ user: userId }),
            Meals.deleteMany({ user: userId }),
            Reminder.deleteMany({ user: userId }),
            Chat.deleteMany({ user: userId }),
            Message.deleteMany({ user: userId }),
        ]);

        res.json({ message: 'Account and all data deleted successfully' });
    } catch (err) {
        res.status(500).json({
            message: 'Failed to delete account',
            error: err.message,
            stack: err.stack,
        });
    }
};


// NEW: Forgot Password - Generate and send OTP
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ msg: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);

        // Save to user with 10-min expiry
        user.resetOtp = hashedOtp;
        user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Send email
        await sendOtpEmail(user, otp);

        res.status(200).json({ msg: 'OTP sent to your email' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

// NEW: Verify OTP - Check and generate reset token
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ msg: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email }).select('+resetOtp +resetOtpExpiry');
        if (!user || !user.resetOtp || user.resetOtpExpiry < Date.now()) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        const isMatch = await bcrypt.compare(otp, user.resetOtp);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        // Clear OTP fields
        user.resetOtp = undefined;
        user.resetOtpExpiry = undefined;
        await user.save();

        // Generate reset token (JWT, expires in 15 min)
        const resetToken = jwt.sign(
            { userId: user._id, type: 'reset' },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.status(200).json({ resetToken });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

// NEW: Reset Password - Verify token and update password
exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ msg: 'Token and new password are required' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ msg: 'Invalid or expired token' });
        }

        if (decoded.type !== 'reset') {
            return res.status(400).json({ msg: 'Invalid token type' });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ msg: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};