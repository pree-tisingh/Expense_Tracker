const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authenticateToken = require('../Middleware/auth');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/me', authenticateToken, userController.getUserDetails);
router.get('/leaderboard', authenticateToken, userController.getLeaderboard);
router.get('/check-premium-status', userController.checkPremiumStatus);
module.exports = router;
