const { DataTypes } = require('sequelize');
const db = require('../utils/db');

const UserLesson = db.define('userLesson', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  status: {
    type: DataTypes.ENUM('not-started', 'in-progress', 'completed'),
    defaultValue: 'not-started',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
});

module.exports = UserLesson;
