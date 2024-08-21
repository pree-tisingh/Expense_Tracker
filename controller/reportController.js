// controllers/report.js
const Expense = require('../models/expense');
const { Op } = require('sequelize');
const DownloadedFile = require('../models/downloadedFile');
const AWS = require('aws-sdk');
const uuid = require('uuid').v4;
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

exports.getDailyReport = async (req, res) => {
    try {
        const userId = req.query.userId;
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { count, rows: expenses } = await Expense.findAndCountAll({
            where: {
                userId,
                createdAt: {
                    [Op.gte]: today,
                    [Op.lt]: tomorrow
                }
            },
            limit: size,
            offset: (page - 1) * size,
        });

        const totalPages = Math.ceil(count / size);

        res.status(200).json({ expenses, totalPages });
    } catch (error) {
        console.error('Error fetching daily report:', error.message);
        res.status(500).json({ error: 'Failed to fetch daily report', details: error.message });
    }
};

exports.getWeeklyReport = async (req, res) => {
    try {
        const userId = req.query.userId;
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        const { count, rows: expenses } = await Expense.findAndCountAll({
            where: {
                userId,
                createdAt: {
                    [Op.gte]: startOfWeek,
                    [Op.lt]: endOfWeek
                }
            },
            limit: size,
            offset: (page - 1) * size,
        });

        const totalPages = Math.ceil(count / size);

        res.status(200).json({ expenses, totalPages });
    } catch (error) {
        console.error('Error fetching weekly report:', error.message);
        res.status(500).json({ error: 'Failed to fetch weekly report', details: error.message });
    }
};

exports.getMonthlyReport = async (req, res) => {
    try {
        const userId = req.query.userId;
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

        const { count, rows: expenses } = await Expense.findAndCountAll({
            where: {
                userId,
                createdAt: {
                    [Op.gte]: startOfMonth,
                    [Op.lt]: endOfMonth
                }
            },
            limit: size,
            offset: (page - 1) * size,
        });

        const totalPages = Math.ceil(count / size);

        res.status(200).json({ expenses, totalPages });
    } catch (error) {
        console.error('Error fetching monthly report:', error.message);
        res.status(500).json({ error: 'Failed to fetch monthly report', details: error.message });
    }
};
exports.downloadReport = async (req, res) => {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const expenses = await Expense.findAll({
            where: {
                userId,
                createdAt: {
                    [Op.gte]: new Date(new Date().setDate(1)), // Start of the month
                    [Op.lt]: new Date(new Date().setMonth(new Date().getMonth() + 1, 1)) // End of the month
                }
            }
        });

        const csvContent = expenses.map(expense => `${expense.createdAt},${expense.description},${expense.amount},${expense.category}`).join('\n');
        const fileName = `${uuid()}.csv`;
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileName,
            Body: csvContent,
            ContentType: 'text/csv'
        };

        const data = await s3.upload(params).promise();

        const downloadedFile = await DownloadedFile.create({
            userId,
            url: data.Location,
            downloadedAt: new Date()
        });

        res.status(200).json({ url: data.Location });
    } catch (error) {
        console.error('Error downloading report:', error);
        res.status(500).json({ error: 'Failed to download report' });
    }
};

exports.getDownloadedFiles = async (req, res) => {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const files = await DownloadedFile.findAll({
            where: { userId },
            order: [['downloadedAt', 'DESC']]
        });

        res.status(200).json(files);
    } catch (error) {
        console.error('Error fetching downloaded files:', error);
        res.status(500).json({ error: 'Failed to fetch downloaded files' });
    }
};