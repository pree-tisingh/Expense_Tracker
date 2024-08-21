require("dotenv").config(); 
const User = require("../models/user");
const Expense = require('../models/expense'); // Adjust the path as needed
const sequelize = require('../utils/database');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const saltRounds = 10;

const isstringinvalid = (string) => {
  return !string || string.trim().length === 0;
}
exports.signup = async (req, res) => {
  try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
          return res.status(400).json({ error: 'All fields are required' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create the user with the hashed password
      const newUser = await User.create({
          name,
          email,
          password: hashedPassword
      });

      return res.status(201).json({ message: 'User successfully created', user: newUser });
  } catch (err) {
      console.error('Error during signup:', err);
      return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
      const { email, password } = req.body;

      if (!email || !password) {
          return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find the user by email
      const user = await User.findOne({ where: { email } });

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Compare the provided password with the stored hash
      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
          return res.status(400).json({ error: 'Password is incorrect' });
      }

      // Generate a JWT token if login is successful
      const token = jwt.sign(
          { id: user.id, name: user.name, isPremium: user.isPremium },
          JWT_SECRET,
          { expiresIn: '1h' }
      );

      return res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ error: 'Internal server error' });
  }
};
  exports.getLeaderboard = async (req, res) => {
    try {
      const users = await User.findAll({
        where: {
          isPremium: true, // Only include premium users
        },
        include: [
          {
            model: Expense,
            attributes: [], // No need to select individual expenses
            required: true, // Only include users with expenses
          },
        ],
        attributes: [
          "id",
          "name",
          [sequelize.fn("SUM", sequelize.col("Expenses.amount")), "totalExpenses"], // Sum of expenses
        ],
        group: ["User.id"], // Group by user
        order: [[sequelize.literal("totalExpenses"), "DESC"]], // Order by total expenses descending
        logging: console.log, // Log SQL queries for debugging
      });
  
      // Check the result for debugging
      console.log("Leaderboard results:", users);
  
      res.status(200).json({ success: true, users });
    } catch (error) {
      console.error("Error fetching leaderboard:", error); // Log the full error
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
  
// User Details Function
exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
const getUserFromToken = async (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authorization header missing or invalid');
  }

  const token = authHeader.split(' ')[1];
  
  try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (!user) {
          throw new Error('User not found');
      }
      return user;
  } catch (error) {
      throw new Error('Invalid or expired token');
  }
};
exports.checkPremiumStatus = async (req, res) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    const isPremium = user.isPremium;
    res.json({ isPremium });
} catch (error) {
    console.error('Error checking premium status:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
}
};
