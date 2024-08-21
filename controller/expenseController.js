const Expense = require('../models/expense');
const sequelize = require('../utils/database');
const { updateTotalExpenses } = require('../utils/expenseUtils');
const { Parser } = require('json2csv'); 

// Fetch all expenses for the authenticated user
exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.findAll({ where: { userId: req.user.id } });
        res.status(200).json({ success: true, expenses });
    } catch (error) {
        console.error('Error fetching expenses:', error.message);
        res.status(500).json({ success: false, message: 'Error fetching expenses', error: error.message });
    }
};

// Add a new expense
exports.addExpense = async (req, res) => {
    const { amount, description, category } = req.body;

    const transaction = await sequelize.transaction();
    try {
        // Validate required fields
        if (!amount || !description || !category) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Add the expense to the database
        const expense = await Expense.create(
            { amount, description, category, userId: req.user.id },
            { transaction }
        );

        // Update the total expenses for the user
        await updateTotalExpenses(req.user.id, transaction);

        // Commit the transaction
        await transaction.commit();

        res.status(201).json({ success: true, message: 'Expense added successfully', expense });
    } catch (error) {
        // Rollback the transaction in case of an error
        await transaction.rollback();
        console.error('Error adding expense:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.deleteExpense = async (req, res) => {
    const { id } = req.params;
    const transaction = await sequelize.transaction();
  
    try {
      const expense = await Expense.findByPk(id, { transaction });
      if (expense) {
        await expense.destroy({ transaction });
        await updateTotalExpenses(req.user.id, transaction);
        await transaction.commit();
        res.status(200).json({ success: true, message: 'Expense deleted successfully' }); // Return a JSON response
      } else {
        await transaction.rollback();
        res.status(404).json({ success: false, message: 'Expense not found' });
      }
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({ success: false, message: error.message });
    }
  };
  exports.getExpensesByPeriod = async (req, res) => {
    const { period } = req.params;
    const userId = req.userId; // Assume userId is set by middleware
    let whereClause = { userId };

    try {
        const today = new Date();
        if (period === 'daily') {
            whereClause.date = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        } else if (period === 'weekly') {
            const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
            const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
            whereClause.date = { [Op.between]: [startOfWeek.toISOString().split('T')[0], endOfWeek.toISOString().split('T')[0]] };
        } else if (period === 'monthly') {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            whereClause.date = { [Op.between]: [startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]] };
        }

        const expenses = await Expense.findAll({ where: whereClause });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expenses' });
    }
};

exports.exportExpenses = async (req, res) => {
    const userId = req.userId; // Assume userId is set by middleware
    try {
        const expenses = await Expense.findAll({ where: { userId } });
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(expenses);
        res.header('Content-Type', 'text/csv');
        res.attachment('expenses.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Error exporting expenses' });
    }
};