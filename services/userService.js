const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require("dotenv").config();

const SALT_ROUNDS = 10;
const JWT_SECRET = 'SUPER_SECRET_BANK_KEY_2026';

async function newUser(name, password, gmail) {
  try {
    const existingUser = await User.findByPk(name);
    if (existingUser) return { status: false, statusCode: -2, message: 'Данный логин уже занят' };

    if (gmail && gmail.trim() !== '') {
      const existingEmail = await User.findOne({ where: { gmail: gmail } });
      if (existingEmail) return { status: false, statusCode: -3, message: 'Этот email уже используется' };
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const createdUser = await User.create({
      user_name: name,
      password: hashedPassword,
      gmail: gmail || null
    });

    const token = jwt.sign({ user_name: createdUser.user_name }, JWT_SECRET, { expiresIn: '2h' });
    return { status: true, statusCode: 1, secure_token: token };
  } catch (err) {
    return { status: false, statusCode: -1, message: err.message };
  }
}

async function loginUser(name, inputPassword) {
  try {
    const user = await User.findByPk(name);
    if (!user) return { status: false, message: 'Неверное имя пользователя или пароль' };

    const isMatch = await bcrypt.compare(inputPassword, user.password);
    if (!isMatch) return { status: false, message: 'Неверное имя пользователя или пароль' };

    const token = jwt.sign({ user_name: user.user_name }, JWT_SECRET, { expiresIn: '2h' });
    return { status: true, message: 'Успешная авторизация', secure_token: token };
  } catch (err) {
    return { status: false, statusCode: -1, message: err.message };
  }
}

async function deleteUser(name) {
  try {
    const deletedCount = await User.destroy({ where: { user_name: name } });
    if (deletedCount === 0) return { status: false, message: 'Пользователь не найден' };
    return { status: true, message: 'Пользователь и его счета успешно удалены' };
  } catch (err) {
    return { status: false, statusCode: -1, message: err.message };
  }
}

module.exports = { newUser, loginUser, deleteUser, JWT_SECRET };