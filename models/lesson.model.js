
const { DataTypes } = require('sequelize');
const db = require('../utils/db');

const Lesson = db.define('lesson', {
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
      notNull: { msg: 'Lesson Title cannot be empty' },
      len: {
        args: [1],
        msg: 'Lesson Title cannot be empty'
      }
    }
  },
  objective: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: {
        args: [1],
        msg: 'Objective cannot be empty',
      }
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notNull: { msg: 'Lesson must have content' },
      len: {
        args: [1],
        msg: 'Lesson must have content',
      }
    }
  },
  completion: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notNull: { msg: 'Completion Criteria must have a value' },
      len: {
        args: [1],
        msg: 'Completion Criteria must have a value',
      }
    }
  }
});

module.exports = Lesson;
