const nodemailer = require('nodemailer');
const path = require('path');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ВАШ_РАБОЧИЙ_GMAIL@gmail.com', // Укажите ваш Gmail
    pass: 'ВАШ_ПРИЛОЖЕНЧЕСКИЙ_ПАРОЛЬ'   // 16-значный пароль приложения Google
  }
});

/**
 * Функция отправки уведомления об изменении баланса с поддержкой вложений
 * @param {string} toEmail - Почта получателя
 * @param {string} username - Имя игрока
 * @param {number} accountId - Номер счета
 * @param {string} operationType - Тип (Пополнение, Списание, Перевод)
 * @param {number} amount - Сумма изменения
 * @param {number} newBalance - Новый остаток на счете
 * @param {string} attachmentPath - (Опционально) Полный путь к файлу чека .txt
 */
async function sendBalanceNotification(toEmail, username, accountId, operationType, amount, newBalance, attachmentPath = null) {
  if (!toEmail || toEmail.trim() === '' || toEmail === 'admin@bank.com') return;

  const mailOptions = {
    from: '"Game-Bank Система" <ВАШ_РАБОЧИЙ_GMAIL@gmail.com>',
    to: toEmail,
    subject: `🔔 Изменение баланса по счету #${accountId} | Game-Bank`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa; border-radius: 8px; max-width: 500px; color: #333;">
        <h2 style="color: #007bff; border-bottom: 2px solid #eee; padding-bottom: 10px;">🏦 Уведомление от Game-Bank</h2>
        <p>Здравствуйте, <strong>${username}</strong>!</p>
        <p>По вашему банковскому счету <strong>#${accountId}</strong> зафиксировано изменение баланса:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Тип операции:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; color: #007bff; font-weight: bold;">${operationType}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Сумма:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${amount} руб.</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; background: #e9ecef;"><strong>Текущий баланс:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; background: #e9ecef; font-weight: bold; color: #28a745;">${newBalance} руб.</td>
          </tr>
        </table>
        ${attachmentPath ? '<p style="font-size: 14px; color: #28a745;">📄 К письму прикреплен официальный текстовый чек транзакции.</p>' : ''}
      </div>
    `,
    attachments: [] // Инициализируем массив вложений
  };

  // Если передан путь к файлу чека, прикрепляем его к письму
  if (attachmentPath) {
    mailOptions.attachments.push({
      filename: path.basename(attachmentPath), // Автоматически возьмет имя файла из пути
      path: attachmentPath
    });
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Уведомление с чеком успешно отправлено пользователю ${username} на почту ${toEmail}`);
  } catch (err) {
    console.error('[Email Error] Не удалось отправить письмо:', err.message);
  }
}

module.exports = { sendBalanceNotification };
