const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../database/models/User');
const Account = require('../database/models/Account');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './public/uploads/avatars/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.name}_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) return cb(null, true);
    cb(new Error('Разрешены только изображения (png, jpg, jpeg, gif)!'));
  },
  limits: { fileSize: 2 * 1024 * 1024 } 
});
const usersHub = require('../database/services/users');
const accountsHub = require('../database/services/accounts');

function verifySession(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ status: false, statusCode: -2, message: 'Доступ запрещен. Вы не авторизованы.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Записываем { name: "игрок" } в запрос
    next();
  } catch (err) {
    return res.status(403).json({ status: false, statusCode: -2, message: 'Сессия устарела. Войдите снова.' });
  }
}
module.exports = function registerRoutes(app) {
  app.post('/api/users/generate-temporary-2fa', async (req, res) => {
    try {
      const otplib = require('otplib');
      const { name } = req.body;
      const temporarySecret = otplib.authenticator.generateSecret();
      const otpauthUrl = otplib.authenticator.keyuri(name || 'User', 'City-Bank', temporarySecret);

      return res.json({ status: true, secret: temporarySecret, otpauthUrl: otpauthUrl });
    } catch (err) {
      return res.status(500).json({ status: false, message: err.message });
    }
  })
  app.post('/api/users/verify-temporary-2fa', async (req, res) => {
    try {
      const otplib = require('otplib');
      const { secret, code } = req.body;

      if (!secret || !code) {
        return res.json({ status: false, message: 'Введите 6-значный код подтверждения' });
      }

      const isValid = otplib.authenticator.check(code, secret);
      if (isValid) {
        return res.json({ status: true, message: 'Код успешно подтвержден' });
      } else {
        return res.json({ status: false, message: 'Неверный одноразовый код токена! Проверьте время на устройстве.' });
      }
    } catch (err) {
      return res.status(500).json({ status: false, message: err.message });
    }
  });
  app.post('/api/users/avatar', verifySession, upload.single('avatar'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ status: false, statusCode: -2, message: 'Файл не загружен' });
    }
    
    // Формируем веб-путь к картинке
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const result = await usersHub.changeAvatar(req.user.name, avatarUrl);
    
    return res.json(result);
  });
  app.get('/api/users/profile', verifySession, async (req, res) => {
    const user = await User.findByPk(req.user.name, { attributes: ['name', 'user_gmail', 'avatar'] });
    if (!user) return res.status(404).json({ status: false });
    return res.json({ status: true, user });
  });
  app.get('/api/users/check-nik', async (req, res) => {
    const user = await User.findByPk(req.query.name);
    if (user) {
      return res.json({ status: false, statusCode: -20, message: 'Никнейм уже занят!' });
    }
    return res.json({ status: true, statusCode: 1 });
  });
  app.get('/api/users/check-gmail', async (req, res) => {
    const user = await User.findOne({ where: { user_gmail: req.query.gmail } });
    if (user) {
      return res.json({ status: false, statusCode: -21, message: 'Данный email уже используется!' });
    }
    return res.json({ status: true, statusCode: 1 });
  });
  app.post('/api/users/register', async (req, res) => {
    const result = await usersHub.registerUser(req.body);
    if (!result.status) return res.status(400).json(result);
    return res.status(201).json(result);
  });
  app.post('/api/users/login', async (req, res) => {
    const { name, password, totpCode } = req.body;
    const result = await usersHub.login(name, password, totpCode);
    
    if (!result.status) {
      // Если это сигнал о необходимости ввода 2FA (код -2)
      if (result.require2FA) {
        return res.status(200).json(result); 
      }
      // Обычная ошибка (неверный пароль и т.д.)
      return res.status(401).json(result);
    }

    // Если всё успешно, генерируем сессионную куку JWT
    const sessionToken = jwt.sign({ name: name }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.cookie('token', sessionToken, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });
    
    return res.json(result);
  });
  app.post('/api/users/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ status: true, statusCode: 1 });
  });
  app.get('/api/users/my-total-manny', verifySession, async (req, res) => {
    const result = await usersHub.mathManny(req.user.name);
    return res.json({ status: result.status, statusCode: result.statusCode, totalManny: result.totalManny, username: req.user.name });
  });
  app.post('/api/accounts', verifySession, async (req, res) => {
    const { pinCode, enableAccount2FA } = req.body;
    const result = await accountsHub.create(req.user.name, pinCode, enableAccount2FA);
    return res.json(result);
  });
  app.get('/api/accounts/my', verifySession, async (req, res) => {
    try {
      const myAccounts = await Account.findAll({ where: { user: req.user.name } });
      return res.json({ status: true, statusCode: 1, accounts: myAccounts });
    } catch (e) {
      return res.status(500).json({ status: false, statusCode: -10 });
    }
  });
  app.delete('/api/accounts/:id', verifySession, async (req, res) => {
    try {
      // Вызываем микро-сервис удаления счета
      const result = await accountsHub.delete(req.params.id, req.user.name);
      
      // КРИТИЧЕСКИ ВАЖНО: всегда возвращаем объект с флагом статуса в JSON
      if (!result.status) {
        return res.status(400).json({
          status: false,
          statusCode: result.statusCode || -11,
          message: result.message || "Не удалось удалить счет"
        });
      }
      
      return res.json({ status: true, statusCode: 1, message: "Счет успешно удален" });
    } catch (err) {
      console.error("Ошибка роута удаления счета:", err.message);
      return res.status(500).json({ status: false, statusCode: -10, message: "Внутренняя ошибка сервера" });
    }
  });

  app.post('/api/accounts/transfer', verifySession, async (req, res) => {
    const { fromId, toId, amount, pinCode, totpCode } = req.body;
    const result = await accountsHub.transfer(fromId, toId, amount, pinCode, totpCode);
    return res.json(result);
  });
  app.post('/api/accounts/credit', verifySession, async (req, res) => {
    const { targetAccountId, amount, paymentsCount, autoWithdrawal, pinCode } = req.body;
    const result = await accountsHub.creatCredit(req.user.name, targetAccountId, amount, pinCode, paymentsCount, autoWithdrawal);
    return res.json(result);
  });
  app.post('/api/admin/accounts/:id/status', verifySession, async (req, res) => {
    if (req.user.name !== 'root') return res.status(403).json({ status: false, statusCode: -2, message: 'Отказано в доступе' });
    
    // 🔑 Вызываем ровно то имя, которое отдает хаб accounts.js
    const result = await accountsHub.changeAccountStatus(req.params.id, req.body.active);
    return res.json(result);
  });

  app.post('/api/admin/accounts/:id/modify', verifySession, async (req, res) => {
    if (req.user.name !== 'root') return res.status(403).json({ status: false, statusCode: -2, message: 'Отказано в доступе' });
    const { amount, type } = req.body;
    
    let result;
    if (type === 'add') {
      result = await accountsHub.addManny(req.params.id, amount);
    } else {
      result = await accountsHub.removeManny(req.params.id, amount);
    }
    return res.json(result);
  });
  app.get('/api/admin/accounts/all', verifySession, async (req, res) => {
    if (req.user.name !== 'root') return res.status(403).json({ status: false, statusCode: -2, message: 'Отказано в доступе' });
    try {
      const allAccounts = await Account.findAll({ order: [['id', 'ASC']] });
      return res.json({ status: true, statusCode: 1, accounts: allAccounts });
    } catch (e) {
      return res.status(500).json({ status: false, statusCode: -10 });
    }
  });
  app.get('/api/users/profile', verifySession, async (req, res) => {
    try {
      const user = await User.findByPk(req.user.name, { attributes: ['name', 'user_gmail', 'two_fa_status', 'avatar'] });
      if (!user) return res.status(404).json({ status: false, message: 'Юзер не найден' });
      return res.json({ status: true, user });
    } catch(e) {
      return res.status(500).json({ status: false, message: 'Внутренняя ошибка бэка' });
    }
  });
  app.post('/api/users/enable-2fa', verifySession, async (req, res) => {
    const result = await usersHub.enable2FA(req.user.name);
    return res.json(result);
  });
  app.post('/api/users/disable-2fa', verifySession, async (req, res) => {
    const result = await usersHub.disable2FA(req.user.name);
    return res.json(result);
  });
  app.get('/api/accounts/my-logs', verifySession, async (req, res) => {
    const result = await accountsHub.getLogs(req.user.name);
    return res.json(result);
  });



  return app;
};