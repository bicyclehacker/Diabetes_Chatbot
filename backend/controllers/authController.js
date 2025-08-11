const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const GlucoseReading = require('../models/GlucoseReading');
const Medication = require('../models/Medication');
const Meals = require('../models/Meals');
const Reminder = require('../models/Reminder');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

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
