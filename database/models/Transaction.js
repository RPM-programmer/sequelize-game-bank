// database/models/Transaction.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/init-db');

module.exports = sequelize.define('transaction_log', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  account_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('DEPOSIT', 'WITHDRAW', 'TRANSFER_OUT', 'TRANSFER_IN'),
    allowNull: false
  },
  sender_or_receiver: {
    type: DataTypes.STRING, // Никнейм контрагента (для переводов) или описание
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  }
});
