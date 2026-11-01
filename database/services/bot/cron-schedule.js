const cron = require("node-cron");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");
const path = require("path");
const sequelize = require(
  path.join(__dirname, "..", "..", "config", "init-db"),
);
const Account = require(path.join(__dirname, "..", "..", "models", "Account"));
const Credit = require(path.join(__dirname, "..", "..", "models", "Credit"));
const User = require(path.join(__dirname, "..", "..", "models", "User"));
const logger = require("custom-color-logs").print;
if (!Account.associations["User"]) {
  Account.belongsTo(User, { foreignKey: "user", as: "User" });
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

transporter.verify((err) => {
  if (err)
    console.log(
      logger.NodemailerError("Ошибка конфигурации почты:", err.message),
    );
  else console.log(logger.NodemailerInfo("Сервер готов к отправке писем"));
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
    console.log(
      logger.ServerCreditNodemailerFunctionPositivePerformance(
        `Письмо успешно отправлено на ${userEmail}`,
      ),
    );
  } catch (error) {
    console.log(
      logger.ServerCreditNodemailerError(
        `Не удалось отправить письмо на ${userEmail}:\n ${error.message}`,
      ),
    );
  }
}
const envMinutes = parseInt(process.env.CRON_CREDIT_INTERVAL_MINUTES, 10);
let cronExpression = "0 0 * * *";

if (!isNaN(envMinutes) && envMinutes > 0) {
  cronExpression = `*/${envMinutes} * * * *`;
  console.log(
    logger.ServerCreditInfo(
      `Установлен кастомный интервал проверки: каждые ${envMinutes} мин. (${cronExpression})`,
    ),
  );
} else {
  console.log(
    logger.ServerCreditInfo(
      `Переменная CRON_CREDIT_INTERVAL_MINUTES не задана. Переход на режим: раз в сутки (${cronExpression})`,
    ),
  );
}
cron.schedule(cronExpression, async () => {
  console.log(
    logger.ServerCreditInfo(`Проверка active кредитов и обработка платежей...`),
  );

  try {
    const activeCredits = await Credit.findAll({
      where: {
        status: "active",
        remainingRepay: { [Op.gt]: 0 },
      },
    });

    if (activeCredits.length === 0) {
      console.log(
        logger.ServerCreditInfo(`Активных кредитов для обработки не найдено.`),
      );
      return;
    }

    for (const activeCreditData of activeCredits) {
      let emailToSend = null;
      let emailSubject = "";
      let emailHtml = "";

      const creditId =
        activeCreditData.id ||
        activeCreditData.get("id") ||
        (activeCreditData.dataValues ? activeCreditData.dataValues.id : null);
      if (!creditId) {
        console.log(
          logger.ServerCreditError(
            `Не удалось определить ID записи кредита. Пропускаем.`,
          ),
        );
        continue;
      }

      const transaction = await sequelize.transaction();

      try {
        const credit = await Credit.findByPk(creditId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (
          !credit ||
          credit.status !== "active" ||
          credit.remainingRepay <= 0
        ) {
          await transaction.rollback();
          continue;
        }

        const calculatedPayment = credit.totalRepay / credit.termMonths;
        const paymentAmount = Math.min(
          calculatedPayment,
          credit.remainingRepay,
        );

        const targetAccountId =
          credit.accountId ||
          credit.account_id ||
          credit.get("accountId") ||
          credit.get("account_id");

        if (!targetAccountId) {
          console.log(
            logger.ServerCreditError(
              `У кредита ID #${credit.id} не найден связанный ID аккаунта`,
            ),
          );
          await transaction.rollback();
          continue;
        }

        const account = await Account.findOne({
          where: { id: targetAccountId },
          include: [{ model: User, as: "User" }],
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!account || !account.User || !account.User.user_gmail) {
          console.log(
            logger.ServerCreditError(
              `Не найден Email (user_gmail) или аккаунт для кредита ID #${credit.id}`,
            ),
          );
          await transaction.rollback();
          continue;
        }

        const userEmail = account.User.user_gmail;

        if (credit.autoRepay) {
          if (account.status === "blocked") {
            throw new Error("Аккаунт заблокирован");
          }

          if (
            account.balance >= paymentAmount ||
            account.manny >= paymentAmount
          ) {
            const balanceField =
              account.manny !== undefined ? "manny" : "balance";
            await account.decrement(balanceField, {
              by: paymentAmount,
              transaction,
            });

            credit.remainingRepay -= paymentAmount;
            if (credit.remainingRepay <= 0) {
              credit.status = "paid";
            }

            await credit.save({ transaction });
            await transaction.commit();

            emailToSend = userEmail;
            emailSubject = "Успешное автосписание по кредиту — Game Bank";
            emailHtml = `<h3>Уважаемый клиент!</h3>
               <p>С вашего баланса было автоматически списано <b>${paymentAmount.toFixed(2)} USD</b> в счет погашения кредита.</p>
               <p>Остаток задолженности: <b>${credit.remainingRepay.toFixed(2)} USD</b>.</p>`;
          } else {
            await transaction.rollback();

            emailToSend = userEmail;
            emailSubject =
              "Ошибка автосписания: недостаточно средств — Game Bank";
            emailHtml = `<h3>Внимание! Недостаточно средств</h3>
               <p>Мы не смогли списать регулярный платеж по кредиту в размере <b>${paymentAmount.toFixed(2)} USD</b>.</p>
               <p>Пожалуйста, пополните баланс вашего аккаунта, чтобы избежать просрочки.</p>`;
          }
        } else {
          await transaction.rollback();
          emailToSend = userEmail;
          emailSubject = "Напоминание о платеже по кредиту — Game Bank";
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
        console.log(
          logger.ServerCreditError(
            `Ошибка обработки кредита ID ${activeCreditData.id}: ${err.message}`,
          ),
        );
      }
    }
  } catch (error) {
    console.log(
      logger.ServerCreditError(
        `Ошибка кредитного планировщика: ${error.message}`,
      ),
    );
  }
});
