
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
  summary: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: {
        args: [1],
        msg: 'Lesson Summary cannot be empty',
      }
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notNull: { msg: 'Lesson must have content' },
      len: {
        args: [5],
        msg: 'Lesson must have content',
      }
    }
  }
});

module.exports = Lesson;
