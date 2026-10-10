const path = require("path")
const Account = require(path.join(__dirname, '..', '..', 'models', 'Account'));
const Transaction = require(path.join(__dirname, '..', '..', 'models', 'Transaction'));
module.exports = async function getAccountLogs(username) {
  try {
    const myAccounts = await Account.findAll({
      where: { user: username },
      attributes: ['id']
    });
    const accountIds = myAccounts.map(acc => acc.id);
    const logs = await Transaction.findAll({
      where: { account_id: accountIds },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    return { status: true, statusCode: 1, logs };
  } catch (err) {
    return { status: false, statusCode: -10, message: err.message };
  }
};