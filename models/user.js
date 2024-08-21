const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    number: {
        type: Sequelize.STRING,
        allowNull: true
    },
    isPremium: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});



// User.beforeCreate(async (user) => {
//     user.password = await bcrypt.hash(user.password, 10);
// });

module.exports = User;
