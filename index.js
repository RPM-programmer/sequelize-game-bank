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

// Навешиваем базовые middleware
app.use(express.json());
app.use(cookieParser());

/**
 * Функция инициализации игрового ядра.
 * Синхронизирует БД и возвращает полностью готовый объект app.
 */
async function initBankModule() {
  try {
    // 1. Синхронизируем таблицы базы данных (код -100 при сбое)
    await sequelize.sync();
    
    // 2. Проверяем или создаем шаблоны генераторов бота
    await writeTemplatesIfNotExist();

    // 3. Автоматическое создание суперадминистратора root
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

    // 4. Навешиваем роуты через модуль server.js
    const configuredApp = registerRoutes(app);
    configuredApp.use(express.static('public'));

    // 5. Возвращаем ИСКЛЮЧИТЕЛЬНО объект app (без .listen)
    return configuredApp;

  } catch (err) {
    console.error('❌ [-100] Критическая ошибка инициализации модулей:', err.message);
    throw err;
  }
}

// Экспортируем функцию инициализации наружу
module.exports = initBankModule;
