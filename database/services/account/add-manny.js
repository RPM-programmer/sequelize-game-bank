const path = require("path");
const Account = require(path.join(__dirname, '..', '..', 'models', 'Account'));
const Transaction = require(path.join(__dirname, '..', '..', 'models', 'Transaction'));
module.exports = async function addManny(accountId, amount) {
  try {
    const acc = await Account.findByPk(accountId);
    if (!acc) return { status: false, statusCode: -2, message: 'Счет не найден' };
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return { status: false, statusCode: -2 };
    await acc.increment('manny', { by: numericAmount });
    await Transaction.create({ account_id: accountId, type: 'DEPOSIT', sender_or_receiver: 'Администрация (ROOT)', amount: numericAmount });
    return { status: true, statusCode: 1 };
  } catch (err) {
    return { status: false, statusCode: -10 };
  }
};