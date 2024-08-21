const Razorpay = require('razorpay');
const Order = require('../models/order');
const User = require('../models/user');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is missing' });
        }

        const amount = 1000 * 100;

        const options = {
            amount: amount,
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).json({ success: false, message: 'Failed to create order' });
        }

        const newOrder = await Order.create({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            status: order.status,
            userId: userId
        });

        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateOrder = async (req, res) => {
    try {
        const { orderId, paymentId, signature } = req.body;

        // Find and update the order
        const order = await Order.findOne({ where: { id: orderId } });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.paymentId = paymentId;
        order.signature = signature;
        order.status = 'completed';
        await order.save();

        // Update the user to premium
        const user = await User.findOne({ where: { id: order.userId } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isPremium = true;
        await user.save();

        res.json({ success: true, message: 'Order updated and user set to premium' });
    } catch (error) {
        console.error('Error updating order:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};