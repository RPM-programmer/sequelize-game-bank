// database/services/bot/bot.js
const fs = require('fs').promises;
const path = require('path');

/**
 * Вспомогательный метод для асинхронного рендеринга и подстановки данных
 */
async function renderTemplate(templateName, ext, vars) {
  try {
    // 🔑 СТРОГО ВЫЧИСЛЯЕМ АБСОЛЮТНЫЙ ПУТЬ к папке generators
    const filePath = path.resolve(__dirname, 'generators', `${templateName}.${ext}`);
    
    // Читаем файл с диска
    let data = await fs.readFile(filePath, 'utf-8');
    
    // Подставляем переменные
    for (const [key, value] of Object.entries(vars)) {
      data = data.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    return data;
  } catch (err) {
    console.error(`[Bot Render Error] Не найден файл ${templateName}.${ext}:`, err.message);
    return ""; // Возвращаем пустую строку вместо падения или перехвата статики
  }
}

/**
 * Главный движок компиляции сообщений бота
 */
async function sendBotNotification(templateName, variables) {
  const txtContent = await renderTemplate(templateName, 'txt', variables);
  const htmlContent = await renderTemplate(templateName, 'html', variables);
  
  console.log(`\n🤖 [City-Bank Bot Engine]: Сгенерировано событие уведомления [${templateName}]`);
  return { txt: txtContent, html: htmlContent };
}

module.exports = { sendBotNotification };
