// database/services/bot/write.js
const fs = require('fs').promises;
const path = require('path');

// 🔑 Путь должен вести строго в текущую подпапку generators
const generatorsDir = path.resolve(__dirname, 'generators');

const textTemplates = {
  'register-bot': "Здравствуйте, {surname} {realName}!\nНа ваш ник {name} зарегистрирован аккаунт в City-bank.\n{twoFaBlock}\nЕсли забыли пароль используйте токен - [{token}]\nВаш пароль - [{password}]\n\nС уважением, система банка City-bank ©",
  'login-bot': "🔔 Вход в систему: Профиль {name} успешно авторизован.",
  'transfer-from-bot': "💸 Списание со счета #{fromId}: {amount} руб. отправлено на счет #{toId}.",
  'transfer-to-bot': "💰 Зачисление на счет #{toId}: Получено {amount} руб. со счета #{fromId}.",
  'enable-2FA-bot': "🔒 Защита 2FA успешно ВКЛЮЧЕНА для аккаунта {name}.",
  'disable-2FA-bot': "⚠️ Защита 2FA ОТКЛЮЧЕНА для аккаунта {name}.",
  'ban-bot': "🚫 Счет #{accountId} ЗАБЛОКИРОВАН администратором.",
  'unban-bot': "✅ Счет #{accountId} РАЗБЛОКИРОВАН администратором."
};

const htmlTemplates = {
  'register-bot': "<h2>Здравствуйте, {surname} {realName}!</h2><p>На ваш счёт зарегистрировали аккаунт в банке City-bank.</p><p>{twoFaBlock}</p><p>Если забыли пароль используйте токен - <b>[{token}]</b></p><p>Ваш пароль - <b>[{password}]</b></p><br><p>С уважением, система банка City-bank ©</p>",
  'login-bot': "<h3>🔔 Уведомление безопасности</h3><p>Успешный вход в личный кабинет: <b>{name}</b></p>",
  'transfer-from-bot': "<h3>💸 Списание со счета</h3><p>Вы перевели <b>{amount} руб.</b> на счет #{toId}</p>",
  'transfer-to-bot': "<h3>💰 Входящий перевод</h3><p>На ваш счет зачислено <b>{amount} руб.</b> от счета #{fromId}</p>",
  'enable-2FA-bot': "<h3>🔒 Защита профиля</h3><p>2FA-статус аккаунта {name} успешно активирован.</p>",
  'disable-2FA-bot': "<h3>⚠️ Снижение уровня защиты</h3><p>2FA-статус аккаунта {name} был отключен.</p>",
  'ban-bot': "<h3 style='color:red;'>🚫 Заморозка счета</h3><p>Ваш банковский счет #{accountId} заблокирован администрацией.</p>",
  'unban-bot': "<h3 style='color:green;'>✅ Разблокировка счета</h3><p>Ваш банковский счет #{accountId} успешно активирован.</p>"
};

async function writeTemplatesIfNotExist() {
  try {
    // Рекурсивно создаем папку generators, если её ещё нет
    await fs.mkdir(generatorsDir, { recursive: true });

    for (const [name, content] of Object.entries(textTemplates)) {
      const p = path.join(generatorsDir, `${name}.txt`);
      try { await fs.access(p); } catch { await fs.writeFile(p, content, 'utf-8'); }
    }

    for (const [name, content] of Object.entries(htmlTemplates)) {
      const p = path.join(generatorsDir, `${name}.html`);
      try { await fs.access(p); } catch { await fs.writeFile(p, content, 'utf-8'); }
    }
  } catch (err) {
    console.error("Ошибка автозаписи генераторов:", err.message);
  }
}

module.exports = { writeTemplatesIfNotExist };
