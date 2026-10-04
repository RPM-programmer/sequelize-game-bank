const bcrypt = require('bcrypt');
const Account = require('../../models/Account');
const User = require('../../models/User');
const sequelize = require('../../config/init-db');
const { sendBotNotification } = require('../bot/bot');

module.exports = async function transferManny(fromId, toId, amount, pinCode, totpCode = null) {
  const t = await sequelize.transaction();
  try {
    // Подгружаем счета с блокировкой строк для обновления (FOR UPDATE)
    const fromAcc = await Account.findByPk(fromId, { transaction: t });
    const toAcc = await Account.findByPk(toId, { transaction: t });

    if (!fromAcc || !toAcc) {
      await t.rollback();
      return { status: false, statusCode: -2, message: 'Один из счетов не найден' };
    }

    if (!fromAcc.active || !toAcc.active) {
      await t.rollback();
      return { status: false, statusCode: -11, message: 'Один из счетов заблокирован' };
    }

    // Проверка пин-кода отправителя по вашему ТЗ (-23)
    const isPinValid = await bcrypt.compare(pinCode, fromAcc.pin_code);
    if (!isPinValid) {
      await t.rollback();
      return { status: false, statusCode: -23, message: 'Неверный пароль щета отправителя' };
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      await t.rollback();
      return { status: false, statusCode: -2, message: 'Некорректная сумма перевода' };
    }

    // Проверка баланса (root-пользователь игнорирует лимиты средств)
    if (fromAcc.user !== 'root' && parseFloat(fromAcc.manny) < numericAmount) {
      await t.rollback();
      return { status: false, statusCode: -11, message: 'Недостаточно средств на счете' };
    }

    // Если на счете включена индивидуальная проверка 2FA
    if (fromAcc.two_fa_status) {
      const owner = await User.findByPk(fromAcc.user, { transaction: t });
      if (owner.two_fa_status) {
        if (!totpCode) {
          await t.rollback();
          return { status: false, statusCode: -2, message: 'Требуется токен подтверждения 2FA' };
        }
        const isTotpValid = await bcrypt.compare(totpCode, owner.two_fa_token);
        if (!isTotpValid) {
          await t.rollback();
          return { status: false, statusCode: -2, message: 'Неверный токен подтверждения 2FA' };
        }
      }
    }

    // Проведение атомарного перевода
    await fromAcc.decrement('manny', { by: numericAmount, transaction: t });
    await toAcc.increment('manny', { by: numericAmount, transaction: t });
        const Transaction = require('../../models/Transaction'); // Импорт в начало файла

    // Вставить перед t.commit():
    await Transaction.create({ account_id: fromId, type: 'TRANSFER_OUT', sender_or_receiver: `На счет #${toId} (${to.user})`, amount: numAmount }, { transaction: t });
    await Transaction.create({ account_id: toId, type: 'TRANSFER_IN', sender_or_receiver: `Со счета #${fromId} (${from.user})`, amount: numAmount }, { transaction: t });

    await t.commit();

    // Обновляем модели для считывания актуального баланса ботом
    await fromAcc.reload();
    await toAcc.reload();

    // Асинхронные уведомления через шаблоны бота
    await sendBotNotification('transfer-from-bot', { fromId, toId, amount: numericAmount, balance: fromAcc.manny });
    await sendBotNotification('transfer-to-bot', { toId, fromId, amount: numericAmount, balance: toAcc.manny });

    return { status: true, statusCode: 1 };
  } catch (err) {
    await t.rollback();
    return { status: false, statusCode: -10, message: err.message };
  }
};
