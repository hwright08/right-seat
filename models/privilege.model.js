const { DataTypes } = require('sequelize');
const db = require('../utils/db');

const Privilege = db.define('privilege', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1]
    }
  },
});

module.exports = Privilege;
