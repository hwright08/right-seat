
const { DataTypes } = require('sequelize');
const db = require('../utils/db');

const Syllabus = db.define('syllabus', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'Syllabus Title cannot be empty' },
      len: {
        args: [1],
        msg: 'Syllabus Title cannot be empty'
      }
    }
  },
  version: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      notNull: { msg: 'Version is required' },
      min: {
        args: 0.1,
        msg: 'Version must be greater than zero',
      }
    }
  },
  displayName: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.title} - Version ${this.version}`
    }
  }
});

module.exports = Syllabus;
