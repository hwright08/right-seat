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
    validate: {
      isIn: ['sales', 'general']
    }
  },
  orgName: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [1]
    }
  },
  contactName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [5]
    }
  },
});

module.exports = Message;
