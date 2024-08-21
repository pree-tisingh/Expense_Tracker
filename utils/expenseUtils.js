const User = require('../models/user'); // Adjust path as needed
const Expense = require('../models/expense');
const updateTotalExpenses = async (userId) => {
  try {
    const totalExpenses = await Expense.sum('amount', {
      where: { userId }
    });

    await User.update({ totalExpenses }, {
      where: { id: userId }
    });
  } catch (error) {
    console.error("Error updating total expenses:", error);
  }
};

module.exports = { updateTotalExpenses };
