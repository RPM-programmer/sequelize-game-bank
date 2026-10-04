const bcrypt = require('bcrypt');
const Account = require('../../models/Account');
const Credit = require('../../models/Credit');
const User = require('../../models/User');
const nodemailer = require('nodemailer');

module.exports = async function creatCredit(username, targetAccountId, amount, pinCode, paymentsCount, autoWithdrawal) {
  try {
    const targetAcc = await Account.findByPk(targetAccountId);
    if (!targetAcc || targetAcc.user !== username) {
      return { status: false, statusCode: -2, message: 'Целевой счет не найден' };
    }

    // Проверка пин-кода (-23)
    const isPinValid = await bcrypt.compare(pinCode, targetAcc.pin_code);
    if (!isPinValid) return { status: false, statusCode: -23, message: 'Неверный пин-код счета' };

    const creditAmount = parseFloat(amount);
    if (isNaN(creditAmount) || creditAmount <= 0) return { status: false, statusCode: -2 };

    const paymentAmount = parseFloat((creditAmount / paymentsCount).toFixed(2));

    // 1. Создаем технический счет кредита, куда начисляются заемные деньги
    const creditAccount = await Account.create({
      user: username,
      pin_code: targetAcc.pin_code,
      manny: creditAmount,
      active: true,
      two_fa_status: false
    });

    // 2. Регистрируем кредит в таблице мониторинга
    const newCredit = await Credit.create({
      account_id: creditAccount.id,
      total_payments: paymentsCount,
      remaining_payments: paymentsCount,
      payment_amount: paymentAmount,
      auto_withdrawal: autoWithdrawal
    });

    /**
     * Автономный метод обработки биллинга (вызывать раз в период через крон / интервал)
     */
    async function processCreditBilling(creditId) {
      try {
        const credit = await Credit.findByPk(creditId, { include: [{ model: Account, as: 'linkedAccount' }] });
        if (!credit) return;

        const linkedAcc = credit.linkedAccount;
        const owner = await User.findByPk(username);

        let paymentSuccess = false;

        // Если автономное списание разрешено ТЗ
        if (credit.auto_withdrawal && linkedAcc) {
          if (parseFloat(linkedAcc.manny) >= parseFloat(credit.payment_amount)) {
            await linkedAcc.decrement('manny', { by: credit.payment_amount });
            credit.remaining_payments -= 1;
            await credit.save();
            paymentSuccess = true;
          } else {
            // Если денег не хватило, переводим в ручной режим для отправки предупреждений
            credit.auto_withdrawal = false;
            await credit.save();
          }
        }

        // Если автосписание выключено или не удалось — отправляем предупреждение на почту по ТЗ
        if (!paymentSuccess && owner) {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.GMAIL, pass: process.env.GOOGLE_APP_PASSWORD }
          });

          await transporter.sendMail({
            from: `"City-bank Биллинг" <${process.env.GMAIL}>`,
            to: owner.user_gmail,
            subject: '⚠️ Требуется оплата по кредиту | City-bank',
            text: `Уважаемый клиент! По вашему кредитному счету #${credit.account_id} зафиксирован обязательный платеж. Вам необходимо внести ${credit.payment_amount} руб.`
          });
        }

        // Если все платежи закрыты — полностью удаляем и закрываем кредит и технический счет по ТЗ
        if (credit.remaining_payments <= 0) {
          if (linkedAcc) await linkedAcc.destroy();
          await credit.destroy();
          console.log(`🎉 Кредит #${creditId} полностью погашен и закрыт.`);
        }
      } catch (billingErr) {
        console.error("Ошибка процессинга кредита:", billingErr.message);
      }
    }

    // Сохраняем ссылку на обработчик в глобальный крон или интервал (в рамках игровой сессии)
    // Для симуляции можно вызывать функцию через setInterval()
    
    return { 
      status: true, 
      statusCode: 1, 
      creditAccountId: creditAccount.id, 
      password: pinCode 
    };
  } catch (err) {
    return { status: false, statusCode: -10, message: err.message };
  }
};
