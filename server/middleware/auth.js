const jwt = require('jsonwebtoken');

function verifySession(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    // 🔑 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Если это запрос страницы — редиректом отправляем на логин,
    // если это запрос к API (fetch) — отдаем json со статус-кодом 401
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.redirect('/login.html');
    }
    return res.status(401).json({ status: false, message: 'Не авторизован' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.redirect('/login.html');
    }
    return res.status(403).json({ status: false, message: 'Сессия устарела' });
  }
}

module.exports = { verifySession };
