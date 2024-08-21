const express = require('express');
const router = express.Router();
const passwordController = require('../controller/passwordController');

router.post('/password/forgotpassword', passwordController.forgotPassword);
router.get('/password/resetpassword/:id', passwordController.validateResetLink);
router.post('/password/resetpassword', passwordController.resetPassword);

module.exports = router;
