const { DataTypes } = require('sequelize');
const db = require('../utils/db');

const Message = db.define('message', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('sales', 'general'),
    allowNull: false,
  },
  orgName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contactName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = Message;
