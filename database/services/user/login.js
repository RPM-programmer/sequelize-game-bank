const bcrypt = require('bcrypt');
const User = require('../../models/User');
const { sendBotNotification } = require('../bot/bot');
const logger = require("custom-color-logs").print;
module.exports = async function loginUser(name, password, totpCode = null) {
  try {
    const user = await User.findByPk(name);
    if (!user) {
      return { status: false, statusCode: -2, message: 'Неверный логин или пароль' };
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { status: false, statusCode: -2, message: 'Неверный логин или пароль' };
    }
    if (name === 'root') {
      await sendBotNotification('login-bot', { name });
      return { status: true, statusCode: 1, message: 'Успешный вход администрации' };
    }
    if (user.two_fa_status) {
      if (!totpCode) {
        return { 
          status: false, 
          statusCode: -2, 
          require2FA: true, 
          message: 'Аккаунт защищен. Пожалуйста, введите временный токен 2FA из приложения:' 
        };
      }
      const isTotpValid = await bcrypt.compare(totpCode, user.two_fa_token);
      if (!isTotpValid) {
        return { status: false, statusCode: -2, message: 'Неверный код 2FA! Попробуйте снова.' };
      }
    }
    await sendBotNotification('login-bot', { name });
    return { status: true, statusCode: 1, message: 'Вход выполнен успешно' };
  } catch (err) {
    console.log(logger.DatabaseError("Ошибка сервиса авторизации:", err.message))
    return { status: false, statusCode: -10, message: 'Ошибка базы данных' };
  }
};