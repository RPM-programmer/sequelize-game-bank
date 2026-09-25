const { DataTypes } = require('sequelize');
const sequelize = require('../config/init-db');

const User = sequelize.define('user', {
  name: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  user_name: {
    type: DataTypes.STRING, // Настоящее имя (bcrypt)
    allowNull: false
  },
  user_surname: {
    type: DataTypes.STRING, // Настоящая фамилия (bcrypt)
    allowNull: false
  },
  user_gmail: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  two_fa_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: '2FA-status'
  },
  two_fa_token: {
    type: DataTypes.STRING, // Хешированный секрет аутентификатора
    allowNull: true,
    field: '2FA-token'
  },
  token: {
    type: DataTypes.STRING, // Хешированный токен аварийного входа
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '/uploads/avatars/default.png' // Стандартная аватарка для всех
  }

});

module.exports = User;
