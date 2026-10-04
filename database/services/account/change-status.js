const Account = require('../../models/Account');
const { sendBotNotification } = require('../bot/bot');
module.exports = async function changeAccountStatus(accountId, isActive) {
  try {
    const [updatedCount] = await Account.update(
      { active: isActive }, 
      { where: { id: accountId } }
    );
    if (updatedCount === 0) {
      return { status: false, statusCode: -2, message: 'Счет не найден в системе' };
    }
    const templateName = isActive ? 'unban-bot' : 'ban-bot';
    await sendBotNotification(templateName, { accountId });
    return { status: true, statusCode: 1 };
  } catch (err) {
    console.error("Ошибка при изменении статуса счета:", err.message);
    return { status: false, statusCode: -10, message: 'Ошибка базы данных' };
  }
};