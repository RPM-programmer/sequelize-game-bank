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



async function initBankModule() {
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
        user_gmail: 'admin@citybank.com',
        two_fa_status: false,
        token: rootEmergencyToken,
        password: rootPasswordHash
      }
    });
    console.log(logger.ServerBankInfo(`Супер пользвотель создан`))

    const configuredApp = registerRoutes(app);

// 1. Открытые папки со стилями, скриптами фронтенда и стандартными картинками
// (Файлы должны лежать в public/css, public/js и т.д.)
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const { verifyPageSession } = require('./server/middleware/auth');

const pages = ['general.html', 'profile.html', 'accounts.html', 'transfer.html', 'history.html', 'credit.html', 'admin.html'];

pages.forEach(page => {
  // Защита страниц: при переходе между ними вылетов не будет
  app.get(`/${page}`, verifyPageSession, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', page));
  });
});


// 3. Открытые страницы, доступные БЕЗ авторизации
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));

// Перенаправление с главного адреса на главную страницу банка
app.get('/', verifySession, (req, res) => res.redirect('/general.html'));

// ... (остальной код возврата configuredApp)

    return configuredApp;
  } catch (err) {
    console.log(logger.ServerBankError("[-100] Критическая ошибка инициализации модулей", err));
    throw err;
  }
}

module.exports = initBankModule;