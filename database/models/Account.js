const { DataTypes } = require('sequelize');
const sequelize = require('../config/init-db');
const User = require('./User');

const Account = sequelize.define('account', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user: {
    type: DataTypes.STRING,
    allowNull: false,
    references: { model: User, key: 'name' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  pin_code: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'pin-code'
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  manny: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  two_fa_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: '2FA-status'
  }
});

User.hasMany(Account, { foreignKey: 'user', sourceKey: 'name' });
Account.belongsTo(User, { foreignKey: 'user', targetKey: 'name', as: 'owner' });

module.exports = Account;
