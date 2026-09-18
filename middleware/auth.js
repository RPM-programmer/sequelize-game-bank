const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../services/userService');

/**
 * Middleware для автоматической проверки авторизации через JWT куки
 */
function verifyToken(req, res, next) {
  // Вытаскиваем токен из кук браузера
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ status: false, message: 'Доступ запрещен. Вы не авторизованы.' });
  }

  try {
    // Проверяем подпись токена секретным ключом банка
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Записываем данные юзера в запрос (req.user.user_name)
    next(); // Пропускаем запрос к финансовым функциям дальше
  } catch (err) {
    return res.status(403).json({ status: false, message: 'Сессия устарела. Пожалуйста, войдите снова.' });
  }
}

module.exports = { verifyToken };
