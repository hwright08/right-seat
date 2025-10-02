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
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  summary: {
    type: DataTypes.STRING,
    allowNull: true,
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
