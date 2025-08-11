const express = require('express');
const router = express.Router();
const userController = require('../controllers/authController.js');
const auth = require('../middleware/authMiddleware.js');


router.get('/me', auth, userController.getUser);
router.patch('/me', auth, userController.updateUser);
router.delete('/me', auth, userController.deleteAccount);


module.exports = router;