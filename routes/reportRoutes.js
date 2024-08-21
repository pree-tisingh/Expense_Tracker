// routes/report.js
const express = require('express');
const router = express.Router();
const reportController = require('../controller/reportController');
const authenticate = require('../Middleware/auth');

router.get('/reports/daily', authenticate, reportController.getDailyReport);
router.get('/reports/weekly', authenticate, reportController.getWeeklyReport);
router.get('/reports/monthly', authenticate, reportController.getMonthlyReport);
router.get('/reports/download', reportController.downloadReport);
router.get('/reports/downloadedfiles', reportController.getDownloadedFiles);
module.exports = router;
