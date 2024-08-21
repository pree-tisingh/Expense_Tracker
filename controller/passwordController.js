const express = require('express');
const router = express.Router();
const User = require('../models/user');
const ForgotPasswordRequest = require('../models/forgotPasswordRequest');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const requestId = uuidv4();
        await ForgotPasswordRequest.create({
            id: requestId,
            userId: user.id,
            isActive: true
        });

        const resetLink = `http://localhost:3000/password/resetpassword/${requestId}`;

        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const mailOptions = {
            from: 'your_email@example.com',
            to: user.email,
            subject: 'Password Reset',
            text: `Click here to reset your password: ${resetLink}`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.validateResetLink = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await ForgotPasswordRequest.findOne({ where: { id, isActive: true } });

        if (!request) {
            return res.status(404).json({ message: 'Invalid or expired reset link' });
        }

        res.status(200).json({ message: 'Reset link is valid' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { id } = req.body;
        const { newPassword } = req.body;

        const request = await ForgotPasswordRequest.findOne({ where: { id, isActive: true } });

        if (!request) {
            return res.status(404).json({ message: 'Invalid or expired reset link' });
        }

        const user = await User.findOne({ where: { id: request.userId } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        request.isActive = false;
        await request.save();

        res.status(200).json({ message: 'Password has been reset' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};