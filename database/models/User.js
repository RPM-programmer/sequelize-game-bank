const { DataTypes } = require('sequelize');
const path = require("path");
const sequelize = require(path.join(__dirname, '..', 'config', 'init-db'));
const User = sequelize.define('user', {
  name: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  user_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_surname: {
    type: DataTypes.STRING,
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
    type: DataTypes.STRING,
    allowNull: true,
    field: '2FA-token'
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: path.join(__dirname, '..', '..', 'uploads', 'avatars', 'default.png')
  }
});
module.exports = User;