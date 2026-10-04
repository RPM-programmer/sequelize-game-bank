const Account = require('../../models/Account');

module.exports = async function findManny(accountId) {
  try {
    const acc = await Account.findByPk(accountId);
    if (!acc) return { status: false, statusCode: -2, message: 'Счет не найден' };

    return { status: true, statusCode: 1, manny: parseFloat(acc.manny) };
  } catch (err) {
    return { status: false, statusCode: -10 };
  }
};
