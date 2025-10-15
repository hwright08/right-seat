const { DataTypes } = require('sequelize');
const db = require('../utils/db');

const Entity = db.define('entity', {
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
      notNull: {
        msg: 'Entity name cannot be empty'
      },
      len: {
        args: [1],
        msg: 'Entity name cannot be empty',
      }
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    len: {
      args: [10],
      message: 'Phone number should be at least 10 characters',
    }
  },
  inactiveDate: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: {
        args: true,
        msg: 'Inactive date is invalid',
      }
    }
  },
});

module.exports = Entity;
