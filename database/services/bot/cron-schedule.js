const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const path = require("path");
const Account = require(path.join(__dirname, '..', '..', 'models', 'Account'));
const Credit = require(path.join(__dirname, '..', '..', 'models', 'Credit'));
const User = require(path.join(__dirname, '..', '..', 'models', 'User'));
const sequelize = require(path.join(__dirname, '..', '..', 'config', 'init-db'));
const logger = require("custom-color-logs").print;
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

transporter.verify((err) => {
  if (err) console.log(logger.NodemailerError('Ошибка конфигурации почты:', err.message));
  else console.log(logger.NodemailerInfo('Сервер готов к отправке писем'));
});

async function sendEmailNotification(userEmail, subject, htmlContent) {
  if (!userEmail) return;
  try {
    await transporter.sendMail({
      from: `"Game Bank" <${process.env.GMAIL}>`,
      to: userEmail,
      subject: subject,
      html: htmlContent,
    });
    console.log(logger.NodemailerFunctionPositivePerformance(`Письмо успешно отправлено на ${userEmail}`));
  } catch (error) {
    console.log(logger.NodemailerError(`Не удалось отправить письмо на ${userEmail}:\n ${error.message}`));
  }
}
cron.schedule('0 0 * * *', async () => {
  console.log(logger.NodemailerFunctionInfo(`Проверка активных кредитов и обработка платежей...`));
  
  try {
    const activeCredits = await Credit.findAll({
      where: {
        status: 'active',
        remainingRepay: { [Op.gt]: 0 }
      }
    });
    for (const activeCreditData of activeCredits) {
      let emailToSend = null;
      let emailSubject = '';
      let emailHtml = '';
      const transaction = await sequelize.transaction();
      try {
        const credit = await Credit.findByPk(activeCreditData.id, {
          transaction,
          lock: transaction.LOCK.UPDATE
        });
        if (!credit || credit.status !== 'active' || credit.remainingRepay <= 0) {
          await transaction.rollback();
          continue;
        }
        const calculatedPayment = credit.totalRepay / credit.termMonths;
        const paymentAmount = Math.min(calculatedPayment, credit.remainingRepay);
        const account = await Account.findOne({
          where: { id: credit.accountId },
          include: [{ model: User, as: 'User' }],
          transaction,
          lock: transaction.LOCK.UPDATE
        });
        if (!account || !account.User || !account.User.gmail) {
          console.error(`[CRON Warning] Не найден Email или аккаунт для кредита ID #${credit.id}`);
          await transaction.rollback();
          continue;
        }
        const userEmail = account.User.gmail;
        if (credit.autoRepay) {
          if (account.status === 'blocked') {
            throw new Error('Аккаунт заблокирован');
          }
          if (account.balance >= paymentAmount) {
            await account.decrement('balance', { by: paymentAmount, transaction });
            credit.remainingRepay -= paymentAmount;
            if (credit.remainingRepay <= 0) {
              credit.status = 'paid';
            }
            await credit.save({ transaction });
            await transaction.commit();
            emailToSend = userEmail;
            emailSubject = 'Успешное автосписание по кредиту — Game Bank';
            emailHtml = `<h3>Уважаемый клиент!</h3>
               <p>С вашего баланса было автоматически списано <b>${paymentAmount.toFixed(2)} USD</b> в счет погашения кредита.</p>
               <p>Остаток задолженности: <b>${credit.remainingRepay.toFixed(2)} USD</b>.</p>`;
          } else {
            await transaction.rollback();

            emailToSend = userEmail;
            emailSubject = 'Ошибка автосписания: недостаточно средств — Game Bank';
            emailHtml = `<h3>Внимание! Недостаточно средств</h3>
               <p>Мы не смогли списать регулярный платеж по кредиту в размере <b>${paymentAmount.toFixed(2)} USD</b>.</p>
               <p>Пожалуйста, пополните баланс вашего аккаунта, чтобы избежать просрочки.</p>`;
          }
        } else {
          await transaction.rollback();
          emailToSend = userEmail;
          emailSubject = 'Напоминание о платеже по кредиту — Game Bank';
          emailHtml = `<h3>Здравствуйте!</h3>
           <p>Напоминаем, что вам необходимо внести обязательный платеж по кредиту в размере <b>${paymentAmount.toFixed(2)} USD</b>.</p>
           <p>Текущий остаток по кредиту: <b>${credit.remainingRepay.toFixed(2)} USD</b>.</p>
           <p>Вы можете оплатить его в личном кабинете.</p>`;
        }
        if (emailToSend) {
          await sendEmailNotification(emailToSend, emailSubject, emailHtml);
        }
      } catch (err) {
        if (transaction && !transaction.finished) {
          await transaction.rollback();
        }
        console.log(logger.NodemailerError(`Ошибка обработки кредита ID ${activeCreditData.id}: ${err.message}`));
      }
    }
  } catch (error) {
    console.log(logger.NodemailerError(`Ошибка кредитного планировщика: ${error.message}`));
  }
});