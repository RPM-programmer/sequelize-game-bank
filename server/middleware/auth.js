const jwt = require('jsonwebtoken');
function verifyPageSession(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login.html');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie('token');
    return res.redirect('/login.html');
  }
}
function verifyApiSession(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ status: false, statusCode: -2, message: 'Сессия отсутствует.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ status: false, statusCode: -2, message: 'Сессия устарела. Войдите снова.' });
  }
}
module.exports = { verifyPageSession, verifyApiSession };