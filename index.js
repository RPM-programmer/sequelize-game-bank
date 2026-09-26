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
    configuredApp.use(express.static('public'));
    return configuredApp;
  } catch (err) {
    console.log(logger.ServerBankError("[-100] Критическая ошибка инициализации модулей"));
    throw err;
  }
}

module.exports = initBankModule;