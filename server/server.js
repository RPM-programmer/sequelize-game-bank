const express = require("express");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

// 1. Сначала обязательно импортируем подключение к базе данных
const sequelize = require('../config/database');

// 2. СТРОГО СЛЕДУЮЩИМИ импортируем модели, чтобы они зарегистрировались в Sequelize
// как только главный файл подключит данный модуль!
const User = require('../models/User');
const Account = require('../models/Account'); 
const TransactionHistory = require('../models/TransactionHistory'); 

// 3. Импортируем сервисы логики и защиту
const userService = require('../services/userService');
const accountService = require('../services/accountService');
const { verifyToken } = require('../middleware/auth');

// Перед тем как делать app.listen(3000, ...)
sequelize.sync()
  .then(() => {
    console.log('База данных успешно синхронизирована (таблицы созданы/проверены)');
  })
  .catch(err => console.error('Ошибка синхронизации БД:', err));



const app = express();

// Базовые настройки Express внутри модуля
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function setServerToExpress() {
  // ==========================================
  // ЮЗЕР-РОУТЫ
  // ==========================================
  app.post('/api/users/register', async (req, res) => {
    const { name, password, gmail } = req.body;
    const result = await userService.newUser(name, password, gmail);
    if (!result.status) return res.status(400).json(result);
    res.cookie('token', result.secure_token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });
    return res.status(201).json({ status: true, message: 'Пользователь успешно зарегистрирован' });
  });

  app.post('/api/users/login', async (req, res) => {
    const { name, password } = req.body;
    const result = await userService.loginUser(name, password);
    if (!result.status) return res.status(401).json(result);
    res.cookie('token', result.secure_token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });
    return res.json({ status: true, message: 'Вход выполнен успешно' });
  });

  app.post('/api/users/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ status: true, message: 'Вы успешно вышли из системы' });
  });

  // ==========================================
  // СЧЕТА И ДЕНЬГИ
  // ==========================================
  app.post('/api/accounts', verifyToken, async (req, res) => {
    const { password, pincode, initialBalance } = req.body;
    const result = await accountService.createAccount(req.user.user_name, password, pincode, initialBalance);
    if (!result.status) return res.status(400).json(result);
    return res.status(201).json(result);
  });

  app.get('/api/accounts/:id/balance', verifyToken, async (req, res) => {
    const result = await accountService.getBalance(req.params.id, req.user.user_name === 'root');
    if (!result.status) return res.status(400).json(result);
    return res.json(result);
  });

  app.get('/api/accounts/total-balance', verifyToken, async (req, res) => {
    const result = await accountService.getTotalUserBalance(req.user.user_name);
    return res.json({ status: result.status, totalBalance: result.totalBalance, username: req.user.user_name });
  });

  app.post('/api/accounts/:id/deposit', verifyToken, async (req, res) => {
    const result = await accountService.increaseFunds(req.params.id, req.body.amount);
    if (!result.status) return res.status(400).json(result);
    return res.json(result);
  });

  app.post('/api/accounts/transfer', verifyToken, async (req, res) => {
    const { fromAccountId, toAccountId, amount, pincode } = req.body;
    const result = await accountService.transferFunds(fromAccountId, toAccountId, amount, pincode);
    if (!result.status) return res.status(400).json(result);
    return res.json(result);
  });

  app.get('/api/accounts/:id/logs', verifyToken, async (req, res) => {
    const result = await accountService.getAccountLogs(req.params.id);
    if (!result.status) return res.status(400).json(result);
    return res.json(result);
  });

  // ==========================================
  // АДМИН-РОУТЫ
  // ==========================================
  app.get('/api/admin/users', verifyToken, async (req, res) => {
    if (req.user.user_name !== 'root') return res.status(403).json({ status: false, message: 'Отказано в доступе' });
    try {
      await delay(1500);
      const users = await User.findAll({ attributes: ['user_name', 'gmail', 'createdAt'] });
      return res.json({ status: true, users });
    } catch (err) {
      return res.status(500).json({ status: false, message: err.message });
    }
  });

  app.get('/api/admin/accounts', verifyToken, async (req, res) => {
    if (req.user.user_name !== 'root') return res.status(403).json({ status: false, message: 'Отказано в доступе' });
    try {
      await delay(1500);
      const accounts = await Account.findAll({ order: [['id', 'ASC']] });
      return res.json({ status: true, accounts: accounts || [] });
    } catch (err) {
      return res.status(500).json({ status: false, message: err.message });
    }
  });

  app.post('/api/accounts/:id/block', verifyToken, async (req, res) => {
    if (req.user.user_name !== 'root') return res.status(403).json({ status: false, message: 'Недостаточно прав' });
    const result = await accountService.blockAccount(req.params.id);
    return res.json(result);
  });

  app.post('/api/accounts/:id/unblock', verifyToken, async (req, res) => {
    if (req.user.user_name !== 'root') return res.status(403).json({ status: false, message: 'Недостаточно прав' });
    const result = await accountService.unblockAccount(req.params.id);
    return res.json(result);
  });

  // 4. Прямое пополнение счета админом (ROOT)
  app.post('/api/admin/accounts/:id/deposit', verifyToken, async (req, res) => {
    if (req.user.user_name !== 'root') return res.status(403).json({ status: false, message: 'Отказано в доступе' });
    try {
      const { amount } = req.body;
      const result = await accountService.increaseFunds(req.params.id, amount);
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ status: false, message: err.message });
    }
  });

  // 5. Прямое списание со счета админом (ROOT)
  app.post('/api/admin/accounts/:id/withdraw', verifyToken, async (req, res) => {
    if (req.user.user_name !== 'root') return res.status(403).json({ status: false, message: 'Отказано в доступе' });
    try {
      const { amount } = req.body;
      const result = await accountService.decreaseFunds(req.params.id, amount);
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ status: false, message: err.message });
    }
  });

  return app; // Возвращаем настроенное приложение Express
}

// Экспортируем функцию инициализации модуля роутов
module.exports.init = setServerToExpress;
