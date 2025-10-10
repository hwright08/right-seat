const { DataTypes } = require('sequelize');
const db = require('../utils/db');

const Subscription = db.define('subscription', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1],
    }
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1],
    }
  },
  summary: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [1],
    }
  },
  price: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  requireSales: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});

module.exports = Subscription;
