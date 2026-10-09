const logger = require("custom-color-logs").print;
console.log(logger.ServerBankInfo("Модуль банка запущен!"))
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const sequelize = require('./database/config/init-db');
const User = require('./database/models/User');
const { writeTemplatesIfNotExist } = require('./database/services/bot/write');
const registerRoutes = require('./server/server');
const Transaction = require('./database/models/Transaction'); 
const app = express();
const path = require("path")
const { verifySession } = require('./server/server');
app.use(express.json());
app.use(cookieParser());
require('./database/services/bot/cron-schedule');
async function Bank() {
  try {
    await sequelize.sync();
    console.log(logger.ServerBankInfo("База данных синхронизирована."));
    await writeTemplatesIfNotExist();
    const rootPassword = process.env.ROOT_PASSWORD || 'bank-root';
    const rootPasswordHash = await bcrypt.hash(rootPassword, 10);
    const systemHash = await bcrypt.hash('SystemAdmin', 10);
    const rootEmergencyToken = await bcrypt.hash('RootEmergencyTokenSafe2026', 10);
    await User.findOrCreate({
      where: { name: 'root' },
      defaults: {
        user_name: systemHash,
        user_surname: systemHash,
        user_gmail: process.env.GMAIL,
        two_fa_status: false,
        token: rootEmergencyToken,
        password: rootPasswordHash
      }
    });
    console.log(logger.ServerBankInfo(`Супер пользвотель создан`))
    const configuredApp = registerRoutes(app);
    app.use('/css', express.static(path.join(__dirname, 'public/css')));
    app.use('/js', express.static(path.join(__dirname, 'public/js')));
    app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
    const { verifyPageSession } = require('./server/middleware/auth');
    const pages = ['general.html', 'profile.html', 'accounts.html', 'transfer.html', 'history.html', 'credit.html', 'admin.html'];
    pages.forEach(page => {
      app.get(`/${page}`, verifyPageSession, (req, res) => {
        res.sendFile(path.join(__dirname, 'public', page));
      });
    });
    app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
    app.get('/register.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
    app.get('/home.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'home.html')));
    app.get('/favicon.ico', (req, res) => res.sendFile(path.join(__dirname, 'public', 'icon', 'icon.png')));
    app.get('/', (req, res) => res.redirect('/home.html'));
    return configuredApp;
  } catch (err) {
    console.log(logger.ServerBankError("Критическая ошибка инициализации модулей", err));
    throw err;
  }
}
module.exports =  Bank ;