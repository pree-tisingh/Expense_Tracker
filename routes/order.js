const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const userController = require('../controller/userController');

const authenticateToken = require('../Middleware/auth');

// Route to create a new order
router.post('/createOrder', authenticateToken, orderController.createOrder);
router.post('/updateOrder', authenticateToken, orderController.updateOrder);


module.exports = router;
