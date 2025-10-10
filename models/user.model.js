const { DataTypes } = require('sequelize');
const db = require('../utils/db');
const { hashPassword } = require('../utils/authUtil');

const User = db.define('user', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1],
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1],
    }
  },
  fullName: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.firstName} ${this.lastName}`;
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    }
  },
  passwrd: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: {
        args: [8],
        msg: 'Password must be at least 8 characters'
      }
    }
  },
  inactiveDate: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  hasGoldSeal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  }
});

// Assign a default password before we validate to avoid not null errors
User.beforeValidate((user) => {
  // Trim strings before we start to validate
  user.dataValues.forEach(key => {
    if (typeof user.dataValues[key] === 'string') {
      user.dataValues[key] = user.dataValues[key].trim();
    }
  });

  if (!user.passwrd) {
    user.passwrd = user.firstName + user.lastName;
  }
});

// Default a password if needed
User.beforeSave(async (user) => {
  if (user.isNewRecord || user.changed('passwrd')) {
    user.passwrd = await hashPassword(user.passwrd);
  }
});

module.exports = User;
