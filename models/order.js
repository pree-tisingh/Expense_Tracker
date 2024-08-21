const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Order = sequelize.define('Order', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    amount: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

module.exports = Order;
