const express = require('express');
const router = express.Router();
const expenseController = require('../controller/expenseController');
const verifyToken = require('../Middleware/auth');

router.post('/addExpense', verifyToken, expenseController.addExpense);
router.get('/getExpenses', verifyToken, expenseController.getExpenses);

router.delete('/:id',verifyToken, expenseController.deleteExpense);
router.get('/:period', verifyToken, expenseController.getExpensesByPeriod);
router.post('/export-expenses', verifyToken, expenseController.exportExpenses);

module.exports = router;
