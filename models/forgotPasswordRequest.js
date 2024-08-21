const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const User = require('../models/user');
const { v4: uuidv4 } = require('uuid');

const ForgotPasswordRequest = sequelize.define('ForgotPasswordRequest', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
    },
});

module.exports = ForgotPasswordRequest;
