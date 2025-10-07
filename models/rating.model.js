const { DataTypes } = require('sequelize');
const db = require('../utils/db');

const Rating = db.define('rating', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Rating;
