const path = require("path");
const bcrypt = require('bcrypt');
const Account = require(path.join(__dirname, '..', '..', 'models', 'Account.js'));
const User = require(path.join(__dirname, '..', '..', 'models', 'User.js'));
const Transaction = require(path.join(__dirname, '..', '..', 'models', 'Transaction.js'));
const sequelize = require(path.join(__dirname, '..', '..', 'config', 'init-db.js'));
const { sendBotNotification } = require(path.join(__dirname, '..', 'bot', 'bot.js'));
const logger = require("custom-color-logs").print;
async function getIdByCard(card) {
    const result = await Account.findOne({
        where:{cardNumber:card.toString()},
        attributes: ['id']
    });
    if (!result) return false
    return result
}
module.exports = async function cardTransfer(card, toId, amount, pinCode) {
  const t = await sequelize.transaction();
  try {
    const fromId = await getIdByCard(card);
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      await t.rollback();
      return { status: false, statusCode: -2, message: 'Некорректная сумма перевода' };
    }
    const fromAcc = await Account.findByPk(fromId, { 
      transaction: t, 
      lock: t.LOCK.UPDATE 
    });
    const toAcc = await Account.findByPk(toId, { 
      transaction: t, 
      lock: t.LOCK.UPDATE 
    });
    if (!fromAcc || !toAcc) {
      await t.rollback();
      return { status: false, statusCode: -2, message: 'Один из счетов не найден' };
    }
    if (!fromAcc.active || !toAcc.active) {
      await t.rollback();
      return { status: false, statusCode: -11, message: 'Один из счетов заблокирован' };
    }
    const isPinValid = await bcrypt.compare(pinCode, fromAcc.pin_code);
    if (!isPinValid) {
      await t.rollback();
      return { status: false, statusCode: -23, message: 'Неверный пароль счета отправителя' };
    }
    if (fromAcc.user !== 'root' && parseFloat(fromAcc.manny) < numericAmount) {
      await t.rollback();
      return { status: false, statusCode: -11, message: 'Недостаточно средств на счете' };
    }
    if (fromAcc.two_fa_status) {
      const owner = await User.findByPk(fromAcc.user, { transaction: t });
      if (owner && owner.two_fa_status) {
        const isTotpValid = await bcrypt.compare(totpCode, owner.two_fa_token);
        if (!isTotpValid) {
          await t.rollback();
          return { status: false, statusCode: -2, message: 'Неверный токен подтверждения 2FA' };
        }
      }
    }
    await fromAcc.decrement('manny', { by: numericAmount, transaction: t });
    await toAcc.increment('manny', { by: numericAmount, transaction: t });
    await Transaction.create({ 
      account_id: fromId, 
      type: 'TRANSFER_OUT', 
      sender_or_receiver: `На счет #${toId} (${toAcc.user})`, 
      amount: numericAmount 
    }, { transaction: t });
    await Transaction.create({ 
      account_id: toId, 
      type: 'TRANSFER_IN', 
      sender_or_receiver: `Со счета #${fromId} (${fromAcc.user})`, 
      amount: numericAmount 
    }, { transaction: t });
    await t.commit();
    await fromAcc.reload();
    await toAcc.reload();
    try {
      await sendBotNotification('transfer-from-bot', { fromId, toId, amount: numericAmount, balance: fromAcc.manny });
      await sendBotNotification('transfer-to-bot', { toId, fromId, amount: numericAmount, balance: toAcc.manny });
    } catch (botErr) {
      console.log(logger.DatabaseError('Ошибка отправки уведомления боту:', botErr.message))
    }
    return { status: true, statusCode: 1 };
  } catch (err) {
    if (!t.finished) {
      await t.rollback();
    }
    return { status: false, statusCode: -10, message: err.message };
  }
};