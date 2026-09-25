const Account = require('../../models/Account');

module.exports = async function deleteAccount(accountId, username) {
  try {
    const acc = await Account.findByPk(accountId);
    if (!acc) return { status: false, statusCode: -2, message: 'Счет не найден' };
    
    // Проверка ограничений ТЗ: счет должен быть активен и пуст
    if (!acc.active || parseFloat(acc.manny) !== 0) {
      return { status: false, statusCode: -11, message: 'Нельзя удалить заблокированный или непустой счет' };
    }

    // Проверка прав владения (пользователь или суперадмин root)
    if (acc.user !== username && username !== 'root') {
      return { status: false, statusCode: -2, message: 'Отказано в доступе' };
    }

    await acc.destroy();
    return { status: true, statusCode: 1 };
  } catch (err) {
    return { status: false, statusCode: -10 };
  }
};
