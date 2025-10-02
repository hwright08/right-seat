const { DataTypes } = require('sequelize');
const db = require('../utils/db');

const SubscriptionFeature = db.define('subscriptionFeature', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  feature: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = SubscriptionFeature;
