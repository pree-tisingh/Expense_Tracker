// models/downloadedFile.js
const { Sequelize } = require('sequelize');
const sequelize = require('../utils/database');

const DownloadedFile = sequelize.define('DownloadedFile', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  url: {
    type: Sequelize.STRING,
    allowNull: false
  },
  downloadedAt: {
    type: Sequelize.DATE,
    allowNull: false
  }
});

module.exports = DownloadedFile;
