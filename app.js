const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./utils/database');
const userRoutes = require('./routes/userRoute');
const expenseRoutes = require('./routes/expressRoute');
const orderRoutes = require('./routes/order');
const passwordRoutes = require('./routes/passwordRoutes');
const ForgotPasswordRequest = require('./models/forgotPasswordRequest');
const reportRoute = require('./routes/reportRoutes');

require('dotenv').config();
const verifyToken = require('./Middleware/auth');

const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/order');

// Define model associations
User.hasMany(Expense, { foreignKey: 'userId', onDelete: 'CASCADE' });
Expense.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ForgotPasswordRequest, { foreignKey: 'userId' });
ForgotPasswordRequest.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

const app = express();

// Apply the body-parser middleware before defining routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "img-src 'self' data: https://img.freepik.com");
    next();
  });
  
app.use(express.static('public'));

// Define routes
app.use('/api', userRoutes);
app.use('/api/expenses', verifyToken, expenseRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api' , reportRoute);
app.use('/api', passwordRoutes); // Ensure this matches the route in the frontend

// Route to get Razorpay key
app.get('/api/razorpay-key', (req, res) => {
    console.log('Razorpay key requested');
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
});

// Sync database and start server
sequelize.sync({ alter: true }).then(() => {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
