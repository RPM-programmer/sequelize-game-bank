const Account = require('../../models/Account');

module.exports = async function removeManny(accountId, amount) {
  try {
    const acc = await Account.findByPk(accountId);
    if (!acc) return { status: false, statusCode: -2, message: 'Счет не найден' };

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return { status: false, statusCode: -2 };

    await acc.decrement('manny', { by: numericAmount });
        const Transaction = require('../../models/Transaction');
    await Transaction.create({ account_id: accountId, type: 'WITHDRAW', sender_or_receiver: 'Администрация (ROOT)', amount: numericAmount });
    return { status: true, statusCode: 1 };
  } catch (err) {
    return { status: false, statusCode: -10 };
  }
};
