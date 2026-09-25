// database/services/user/login.js
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const { sendBotNotification } = require('../bot/bot');

module.exports = async function loginUser(name, password, totpCode = null) {
  try {
    const user = await User.findByPk(name);
    if (!user) {
      return { status: false, statusCode: -2, message: 'Неверный логин или пароль' };
    }

    // Проверяем хэш пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { status: false, statusCode: -2, message: 'Неверный логин или пароль' };
    }

    // 👑 ИСКЛЮЧЕНИЕ ДЛЯ АДМИНА: У пользователя root никогда не требуем 2FA при входе
    if (name === 'root') {
      await sendBotNotification('login-bot', { name });
      return { status: true, statusCode: 1, message: 'Успешный вход администрации' };
    }

    // Проверка 2FA для остальных игроков
    if (user.two_fa_status) {
      if (!totpCode) {
        // 🔑 Исправлено: гарантируем передачу четкого сообщения вместо undefined
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

    // Уведомление бота о входе игрока
    await sendBotNotification('login-bot', { name });

    return { status: true, statusCode: 1, message: 'Вход выполнен успешно' };
  } catch (err) {
    console.error("Ошибка сервиса авторизации:", err.message);
    return { status: false, statusCode: -10, message: 'Ошибка базы данных' };
  }
};
