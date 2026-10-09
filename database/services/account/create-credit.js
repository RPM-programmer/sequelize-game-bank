const Account = require('./../../models/Account');
const Credit = require('./../../models/Credit');
const sequelize = require('./../../config/init-db');
async function createCredit({ accountId, amount, autoRepay = false, rate = 0.1, termMonths = 12 }) {
  const numericAmount = parseFloat(amount);
  const numericRate = parseFloat(rate);
  const numericTerm = parseInt(termMonths, 10);
  if (!accountId || isNaN(numericAmount) || numericAmount <= 0) {
    return { success: false, error: 'Некорректные параметры для создания кредита' };
  }
  if (isNaN(numericRate) || numericRate < 0 || isNaN(numericTerm) || numericTerm <= 0) {
    return { success: false, error: 'Некорректная процентная ставка или срок кредитования' };
  }
  const transaction = await sequelize.transaction();
  try {
    const account = await Account.findOne({
      where: { id: accountId },
      lock: transaction.LOCK.UPDATE,
      transaction
    });
    if (!account) throw new Error('Аккаунт не найден');
    if (account.status === 'blocked') throw new Error('Аккаунт заблокирован');
    const existingCredit = await Credit.findOne({
      where: { accountId: account.id, status: 'active' },
      transaction,
      lock: transaction.LOCK.UPDATE
    });
    if (existingCredit) {
      throw new Error('У этого аккаунта уже есть активный кредит');
    }
    const totalRepay = numericAmount * (1 + numericRate);
    const credit = await Credit.create({
      accountId: account.id,
      amount: numericAmount,
      totalRepay: totalRepay,
      remainingRepay: totalRepay,
      status: 'active',
      autoRepay: !!autoRepay,
      termMonths: numericTerm
    }, { transaction });
    await account.increment('balance', { by: numericAmount, transaction });
    await transaction.commit();
    return {
      success: true,
      message: 'Кредит успешно оформлен',
      creditId: credit.id
    };
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    return { success: false, error: error.message };
  }
}
module.exports = createCredit;