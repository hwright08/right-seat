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
      notNull: {
        msg: 'First Name cannot be empty'
      },
      len: {
        args: [1],
        msg: 'First Name cannot be empty',
      }
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Last Name cannot be empty'
      },
      len: {
        args: [1],
        msg: 'Last Name cannot be empty',
      }
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
      notNull: {
        msg: 'Email cannot be empty'
      },
      isEmail: {
        msg: 'Invalid email',
      }
    }
  },
  passwrd: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Password cannot be empty'
      },
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
      isDate: {
        args: true,
        msg: 'Inactive date is invalid',
      }
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
