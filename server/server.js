const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require(
  path.join(__dirname, "..", "database", "models", "User.js"),
);
const Account = require(
  path.join(__dirname, "..", "database", "models", "Account.js"),
);
const Credit = require(
  path.join(__dirname, "..", "database", "models", "Credit.js"),
);
const sequelize = require(
  path.join(__dirname, "..", "database", "config", "init-db.js"),
);
const multer = require("multer");
const fs = require("fs");
const express = require("express");
const logger = require("custom-color-logs").print;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "..", "public", "uploads", "avatars");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.name}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    if (extname) return cb(null, true);
    cb(new Error("Разрешены только изображения (png, jpg, jpeg, gif)!"));
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});
const usersHub = require(
  path.join(__dirname, "..", "database", "services", "users.js"),
);
const accountsHub = require(
  path.join(__dirname, "..", "database", "services", "accounts.js"),
);

function verifySession(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      status: false,
      statusCode: -2,
      message: "Доступ запрещен. Вы не авторизованы.",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      status: false,
      statusCode: -2,
      message: "Сессия устарела. Войдите снова.",
    });
  }
}
module.exports = function registerRoutes() {
  const get = express.Router();
  const post = express.Router();
  post.post("/users/generate-temporary-2fa", async (req, res) => {
    try {
      const otplib = require("otplib");
      const { name } = req.body;
      const temporarySecret = otplib.authenticator.generateSecret();
      const otpauthUrl = otplib.authenticator.keyuri(
        name || "User",
        "City-Bank",
        temporarySecret,
      );
      return res.json({
        status: true,
        secret: temporarySecret,
        otpauthUrl: otpauthUrl,
      });
    } catch (err) {
      return res.status(500).json({ status: false, message: err.message });
    }
  });
  post.post("/users/verify-temporary-2fa", async (req, res) => {
    try {
      const otplib = require("otplib");
      const { secret, code } = req.body;
      if (!secret || !code) {
        return res.json({
          status: false,
          message: "Введите 6-значный код подтверждения",
        });
      }
      const isValid = otplib.authenticator.check(code, secret);
      if (isValid) {
        return res.json({ status: true, message: "Код успешно подтвержден" });
      } else {
        return res.json({
          status: false,
          message:
            "Неверный одноразовый код токена! Проверьте время на устройстве.",
        });
      }
    } catch (err) {
      return res.status(500).json({ status: false, message: err.message });
    }
  });
  post.post(
    "/users/avatar",
    verifySession,
    upload.single("avatar"),
    async (req, res) => {
      if (!req.file) {
        return res
          .status(400)
          .json({ status: false, statusCode: -2, message: "Файл не загружен" });
      }
      const avatarUrl = `/api/bank/uploads/avatars/${req.file.filename}`;
      const result = await usersHub.changeAvatar(req.user.name, avatarUrl);
      return res.json(result);
    },
  );
  post.get("/users/profile", verifySession, async (req, res) => {
    const user = await User.findByPk(req.user.name, {
      attributes: ["name", "user_gmail", "avatar"],
    });
    if (!user) return res.status(404).json({ status: false });
    return res.json({ status: true, user });
  });
  post.get("/users/check-nik", async (req, res) => {
    const user = await User.findByPk(req.query.name);
    if (user) {
      return res.json({
        status: false,
        statusCode: -20,
        message: "Никнейм уже занят!",
      });
    }
    return res.json({ status: true, statusCode: 1 });
  });
  post.get("/users/check-gmail", async (req, res) => {
    const user = await User.findOne({ where: { user_gmail: req.query.gmail } });
    if (user) {
      return res.json({
        status: false,
        statusCode: -21,
        message: "Данный email уже используется!",
      });
    }
    return res.json({ status: true, statusCode: 1 });
  });
  post.post("/users/register", async (req, res) => {
    const result = await usersHub.registerUser(req.body);
    if (!result.status) return res.status(400).json(result);
    return res.status(201).json(result);
  });
  post.post("/users/login", async (req, res) => {
    const { name, password, totpCode } = req.body;
    const result = await usersHub.login(name, password, totpCode);
    if (!result.status) {
      if (result.require2FA) {
        return res.status(200).json(result);
      }
      return res.status(401).json(result);
    }
    const sessionToken = jwt.sign({ name: name }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    res.cookie("token", sessionToken, {
      httpOnly: true,
      maxAge: 2 * 60 * 60 * 1000,
    });
    return res.json(result);
  });
  post.post("/users/logout", (req, res) => {
    res.clearCookie("token");
    return res.json({ status: true, statusCode: 1 });
  });
  post.get("/users/my-total-manny", verifySession, async (req, res) => {
    const result = await usersHub.mathManny(req.user.name);
    return res.json({
      status: result.status,
      statusCode: result.statusCode,
      totalManny: result.totalManny,
      username: req.user.name,
    });
  });
  post.post("/accounts", verifySession, async (req, res) => {
    const { pinCode, enableAccount2FA } = req.body;
    const result = await accountsHub.create(
      req.user.name,
      pinCode,
      enableAccount2FA,
    );
    return res.json(result);
  });
  post.get("/accounts/my", verifySession, async (req, res) => {
    try {
      const myAccounts = await Account.findAll({
        where: { user: req.user.name },
      });
      return res.json({ status: true, statusCode: 1, accounts: myAccounts });
    } catch (e) {
      return res.status(500).json({ status: false, statusCode: -10 });
    }
  });
  post.delete("/accounts/:id", verifySession, async (req, res) => {
    try {
      const result = await accountsHub.delete(req.params.id, req.user.name);
      if (!result.status) {
        return res.status(400).json({
          status: false,
          statusCode: result.statusCode || -11,
          message: result.message || "Не удалось удалить счет",
        });
      }
      return res.json({
        status: true,
        statusCode: 1,
        message: "Счет успешно удален",
      });
    } catch (err) {
      console.log(
        logger.ServerError("Ошибка роута удаления счета:", err.message),
      );
      return res.status(500).json({
        status: false,
        statusCode: -10,
        message: "Внутренняя ошибка сервера",
      });
    }
  });
  post.post("/accounts/transfer", verifySession, async (req, res) => {
    const { fromId, toId, amount, pinCode, totpCode } = req.body;
    const result = await accountsHub.transfer(
      fromId,
      toId,
      amount,
      pinCode,
      totpCode,
    );
    return res.json(result);
  });
  post.post("/accounts/credit", verifySession, async (req, res) => {
    const { targetAccountId, amount, paymentsCount, autoWithdrawal, pinCode } =
      req.body;
    const result = await accountsHub.creatCredit(
      req.user.name,
      targetAccountId,
      amount,
      pinCode,
      paymentsCount,
      autoWithdrawal,
    );
    return res.json(result);
  });
  post.post("/admin/accounts/:id/status", verifySession, async (req, res) => {
    if (req.user.name !== "root")
      return res
        .status(403)
        .json({ status: false, statusCode: -2, message: "Отказано в доступе" });
    const result = await accountsHub.changeAccountStatus(
      req.params.id,
      req.body.active,
    );
    return res.json(result);
  });
  post.post("/admin/accounts/:id/modify", verifySession, async (req, res) => {
    if (req.user.name !== "root")
      return res
        .status(403)
        .json({ status: false, statusCode: -2, message: "Отказано в доступе" });
    const { amount, type } = req.body;
    let result;
    if (type === "add") {
      result = await accountsHub.addManny(req.params.id, amount);
    } else {
      result = await accountsHub.removeManny(req.params.id, amount);
    }
    return res.json(result);
  });
  post.get("/admin/accounts/all", verifySession, async (req, res) => {
    if (req.user.name !== "root")
      return res
        .status(403)
        .json({ status: false, statusCode: -2, message: "Отказано в доступе" });
    try {
      const allAccounts = await Account.findAll({ order: [["id", "ASC"]] });
      return res.json({ status: true, statusCode: 1, accounts: allAccounts });
    } catch (e) {
      return res.status(500).json({ status: false, statusCode: -10 });
    }
  });
  post.get("/users/profile/settings", verifySession, async (req, res) => {
    try {
      const user = await User.findByPk(req.user.name, {
        attributes: ["name", "user_gmail", "two_fa_status", "avatar"],
      });
      if (!user)
        return res
          .status(404)
          .json({ status: false, message: "Юзер не найден" });
      return res.json({ status: true, user });
    } catch (e) {
      return res
        .status(500)
        .json({ status: false, message: "Внутренняя ошибка бэка" });
    }
  });
  post.post("/users/enable-2fa", verifySession, async (req, res) => {
    const result = await usersHub.enable2FA(req.user.name);
    return res.json(result);
  });
  post.post("/users/disable-2fa", verifySession, async (req, res) => {
    const result = await usersHub.disable2FA(req.user.name);
    return res.json(result);
  });
  post.get("/accounts/my-logs", verifySession, async (req, res) => {
    const result = await accountsHub.getLogs(req.user.name);
    return res.json(result);
  });
  post.post("/terminal/register", async (req, res) => {
    if (!req.body) return res.sendStatus(400);
    const id = req.body.id;
    const pincode = req.body.pincode;
    const card = req.body.card;
    const result = await accountsHub.linkACard(card, id, pincode);
    if (!result.status) return res.sendStatus(422);
    return res.sendStatus(200);
  });
  post.post("/terminal/transfer", async (req, res) => {
    const card = req.body.card;
    const to = req.body.to;
    const pincode = req.body.pincode;
    const manny = req.body.manny;
    const result = await accountsHub.cardTransfer(card, to, manny, pincode);
  });
  post.post("/accounts/credit/pay", verifySession, async (req, res) => {
    const { creditId, amount, pinCode } = req.body;
    const numericAmount = parseFloat(amount);

    if (!creditId || isNaN(numericAmount) || numericAmount <= 0) {
      return res
        .status(400)
        .json({ status: false, message: "Некорректная сумма или ID кредита" });
    }

    const transaction = await sequelize.transaction();
    try {
      const credit = await Credit.findByPk(creditId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!credit || credit.status !== "active")
        throw new Error("Активный кредит не найден");

      const targetAccountId = credit.accountId || credit.account_id;
      const account = await Account.findByPk(targetAccountId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!account) throw new Error("Счет не найден");
      if (account.user !== req.user.name)
        throw new Error("Нет доступа к этому счету");
      if (account.status === "blocked") throw new Error("Счет заблокирован");

      const bcrypt = require("bcrypt");
      const isPinValid = await bcrypt.compare(
        pinCode,
        account.pincode || account.pin_code,
      );
      if (!isPinValid) throw new Error("Неверный PIN-код счета");

      const balanceField = account.manny !== undefined ? "manny" : "balance";
      const currentBalance = parseFloat(account[balanceField]);

      if (currentBalance < numericAmount)
        throw new Error("Недостаточно средств на счете");

      const finalPayment = Math.min(
        numericAmount,
        parseFloat(credit.remainingRepay),
      );

      await account.decrement(balanceField, { by: finalPayment, transaction });

      credit.remainingRepay = parseFloat(credit.remainingRepay) - finalPayment;
      if (credit.remainingRepay <= 0) {
        credit.status = "paid";
      }
      await credit.save({ transaction });

      if (typeof accountsHub.getLogs === "function") {
      }

      await transaction.commit();
      return res.json({
        status: true,
        message:
          credit.status === "paid"
            ? "Кредит полностью погашен!"
            : `Успешно оплачено ${finalPayment.toFixed(2)} руб.`,
        remainingRepay: credit.remainingRepay,
      });
    } catch (error) {
      if (transaction && !transaction.finished) await transaction.rollback();
      return res.status(400).json({ status: false, message: error.message });
    }
  });
  post.get("/accounts/my-current-credit", verifySession, async (req, res) => {
    try {
      const myAccounts = await Account.findAll({
        where: { user: req.user.name },
      });

      if (!myAccounts || myAccounts.length === 0) {
        return res.json({ status: true, activeCredit: null });
      }

      const accountIds = myAccounts.map((acc) => acc.id);

      const { Op } = require("sequelize");
      const activeCredit = await Credit.findOne({
        where: {
          status: "active",
          accountId: accountIds,
        },
      });

      return res.json({ status: true, activeCredit: activeCredit || null });
    } catch (error) {
      console.error("Ошибка при получении текущего кредита:", error.message);
      return res
        .status(500)
        .json({ status: false, message: "Внутренняя ошибка сервера" });
    }
  });

  return { GET: get, POST: post };
};
module.exports.verifySession = verifySession;
