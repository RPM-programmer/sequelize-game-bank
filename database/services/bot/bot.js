const fs = require('fs').promises;
const path = require('path');
const logger = require("custom-color-logs").print;
async function renderTemplate(templateName, ext, vars) {
  try {
    const filePath = path.resolve(__dirname, 'generators', `${templateName}.${ext}`);
    let data = await fs.readFile(filePath, 'utf-8');
    for (const [key, value] of Object.entries(vars)) {
      data = data.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    return data;
  } catch (err) {
    console.log(logger.NodemailerError(`[Bot Render Error] Не найден файл ${templateName}.${ext}:`, err.message))
    return "";
  }
}
async function sendBotNotification(templateName, variables) {
  const txtContent = await renderTemplate(templateName, 'txt', variables);
  const htmlContent = await renderTemplate(templateName, 'html', variables);
  console.log(logger.NodemailerInfo(`Сгенерировано событие уведомления [${templateName}]`))
  return { txt: txtContent, html: htmlContent };
}
module.exports = { sendBotNotification };