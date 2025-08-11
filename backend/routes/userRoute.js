const express = require('express');
const User = require('../models/User');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // if you have JWT auth

// PUT /api/user/notifications
router.put('/notifications', authMiddleware, async (req, res) => {
    try {
        const { notifications } = req.body;

        if (!notifications) {
            return res.status(400).json({ message: "Notifications data is required" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, // from auth middleware
            { notifications },
            { new: true }
        );

        res.json(updatedUser.notifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
