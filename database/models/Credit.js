const { DataTypes } = require('sequelize');
const sequelize = require('../config/init-db');
const Account = require('./Account');

const Credit = sequelize.define('credit', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  account_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Account, key: 'id' },
    onDelete: 'CASCADE'
  },
  total_payments: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  remaining_payments: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  payment_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  auto_withdrawal: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

Account.hasMany(Credit, { foreignKey: 'account_id' });
Credit.belongsTo(Account, { foreignKey: 'account_id', as: 'linkedAccount' });

module.exports = Credit;
