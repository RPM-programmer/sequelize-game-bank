const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TransactionHistory = sequelize.define('transaction_history', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('DEPOSIT', 'WITHDRAW', 'TRANSFER', 'BLOCK', 'UNBLOCK'),
    allowNull: false
  },
  from_account_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  to_account_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false // 'SUCCESS' или 'FAILED'
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = TransactionHistory;
