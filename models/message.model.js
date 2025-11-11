const { DataTypes } = require('sequelize');
const db = require('../utils/db');

const Message = db.define('message', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('sales', 'general'),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Message type cannot be empty'
      },
      isIn: {
        args: [['sales', 'general']],
        msg: 'Message type must be "sales" or "general"'
      }
    }
  },
  orgName: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: {
        args: [1],
        msg: 'Organization name cannot be empty'
      }
    }
  },
  contactName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Contact name cannot be empty'
      },
      len: {
        args: [1],
        msg: 'Contact name cannot be empty'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Email cannot be empty'
      },
      isEmail: {
        msg: 'Invalid email',
      }
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Message cannot be empty'
      },
      len: {
        args: [5],
        msg: 'Invalid message',
      }
    }
  },
  resolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  }
}, {
  validate: {
    orgNameRequiredForSales() {
      if (this.type === 'sales') {
        const val = this.orgName;
        if (!val) {
          throw new Error('Organization Name cannot be empty');
        }
      }
    }
  }
});

module.exports = Message;
