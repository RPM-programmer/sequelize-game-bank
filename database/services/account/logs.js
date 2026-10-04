// database/services/account/logs.js
const Account = require('../../models/Account');
const Transaction = require('../../models/Transaction');

module.exports = async function getAccountLogs(username) {
  try {
    // Находим все ID счетов, принадлежащих этому пользователю
    const myAccounts = await Account.findAll({
      where: { user: username },
      attributes: ['id']
    });
    
    const accountIds = myAccounts.map(acc => acc.id);

    // Запрашиваем логи по этим счетам
    const logs = await Transaction.findAll({
      where: { account_id: accountIds },
      order: [['createdAt', 'DESC']], // Сначала самые свежие
      limit: 50 // Ограничим вывод последними 50 операциями
    });

    return { status: true, statusCode: 1, logs };
  } catch (err) {
    return { status: false, statusCode: -10, message: err.message };
  }
};
