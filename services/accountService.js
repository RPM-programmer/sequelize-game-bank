const bcrypt = require('bcrypt');
const Account = require('../models/Account');
const User = require('../models/User');
const TransactionHistory = require('../models/TransactionHistory');
const sequelize = require('../config/database');
const { sendBalanceNotification } = require('./emailService');

const SALT_ROUNDS = 10;

async function createAccount(userLogin, accountPassword, pincode, initialBalance = 0.00) {
  try {
    const userExists = await User.findByPk(userLogin);
    if (!userExists) return { status: false, message: 'Указанный пользователь не существует' };
    if (parseFloat(initialBalance) < 0) return { status: false, message: 'Начальный баланс не может быть меньше нуля' };

    const hashedAccPassword = await bcrypt.hash(accountPassword, SALT_ROUNDS);
    const hashedPincode = await bcrypt.hash(pincode, SALT_ROUNDS);

    const newAcc = await Account.create({
      user_login: userLogin,
      password: hashedAccPassword,
      pincode: hashedPincode,
      balance: initialBalance
    });

    if (parseFloat(initialBalance) > 0) {
      await TransactionHistory.create({ type: 'DEPOSIT', to_account_id: newAcc.id, amount: initialBalance, status: 'SUCCESS', details: 'Стартовый баланс' });
    }
    return { status: true, account_id: newAcc.id };
  } catch (err) {
    return { status: false, statusCode: -1, message: err.message };
  }
}

async function deleteAccount(accountId) {
  try {
    const deleted = await Account.destroy({ where: { id: accountId } });
    if (deleted === 0) return { status: false, message: 'Счет не найден' };
    return { status: true, message: 'Счет успешно удален' };
  } catch (err) {
    return { status: false, statusCode: -1, message: err.message };
  }
}

async function getBalance(accountId, isSuperAdmin = false) {
  try {
    // Подгружаем счет вместе с пользователем
    const acc = await Account.findByPk(accountId, { include: { model: User, as: 'user' } });
    if (!acc) return { status: false, message: 'Счет не найден' };
    if (acc.block_status && !isSuperAdmin) return { status: false, message: 'Счет заблокирован!' };

    // 🔥 ЕСЛИ ВЛАДЕЛЕЦ ROOT — БАЛАНС БЕСКОНЕЧЕН
    if (acc.user && acc.user.user_name === 'root') {
      return { status: true, balance: 'Infinity' }; // Передаем строку или Infinity
    }

    return { status: true, balance: parseFloat(acc.balance) };
  } catch (err) {
    return { status: false, statusCode: -1, message: err.message };
  }
}


async function blockAccount(accountId) {
  try {
    const [updated] = await Account.update({ block_status: true }, { where: { id: accountId } });
    if (updated === 0) return { status: false, message: 'Счет не найден' };
    await TransactionHistory.create({ type: 'BLOCK', from_account_id: accountId, amount: 0, status: 'SUCCESS' });
    return { status: true, message: 'Счет заблокирован' };
  } catch (err) {
    return { status: false, statusCode: -1, message: err.message };
  }
}

async function unblockAccount(accountId) {
  try {
    const [updated] = await Account.update({ block_status: false }, { where: { id: accountId } });
    if (updated === 0) return { status: false, message: 'Счет не найден' };
    await TransactionHistory.create({ type: 'UNBLOCK', from_account_id: accountId, amount: 0, status: 'SUCCESS' });
    return { status: true, message: 'Счет успешно разблокирован' };
  } catch (err) {
    return { status: false, statusCode: -1, message: err.message };
  }
}

async function increaseFunds(accountId, amount) {
  try {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return { status: false, message: 'Сумма должна быть больше нуля' };

    const acc = await Account.findByPk(accountId, { include: { model: User, as: 'user' } });
    if (!acc) return { status: false, message: 'Счет не найден' };
    if (acc.block_status) return { status: false, message: 'Счет заблокирован' };

    acc.balance = parseFloat(acc.balance) + numericAmount;
    await acc.save();

    await TransactionHistory.create({ type: 'DEPOSIT', to_account_id: accountId, amount: numericAmount, status: 'SUCCESS' });

    if (acc.user) {
      sendBalanceNotification(acc.user.gmail, acc.user.user_name, acc.id, 'Пополнение баланса (DEPOSIT)', numericAmount, acc.balance);
    }
    return { status: true, newBalance: parseFloat(acc.balance) };
  } catch (err) {
    return { status: false, statusCode: -1, message: err.message };
  }
}

async function decreaseFunds(accountId, amount) {
  try {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return { status: false, message: 'Сумма должна быть больше нуля' };

    const acc = await Account.findByPk(accountId, { include: { model: User, as: 'user' } });
    if (!acc) return { status: false, message: 'Счет не найден' };
    if (acc.block_status) return { status: false, message: 'Счет заблокирован' };
    // Если это НЕ root и денег не хватает — выдаем ошибку
if (acc.user_login !== 'root' && parseFloat(acc.balance) < numericAmount) {
  return { status: false, message: 'Недостаточно средств' };
}


    acc.balance = parseFloat(acc.balance) - numericAmount;
    await acc.save();

    await TransactionHistory.create({ type: 'WITHDRAW', from_account_id: accountId, amount: numericAmount, status: 'SUCCESS' });

    if (acc.user) {
      sendBalanceNotification(acc.user.gmail, acc.user.user_name, acc.id, 'Списание средств (WITHDRAW)', numericAmount, acc.balance);
    }
    return { status: true, newBalance: parseFloat(acc.balance) };
  } catch (err) {
    return { status: false, statusCode: -1, message: err.message };
  }
}

async function transferFunds(fromAccountId, toAccountId, amount, pincode) {
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) return { status: false, message: 'Сумма должна быть больше нуля' };

  const t = await sequelize.transaction();
  try {
    const fromAcc = await Account.findByPk(fromAccountId, { transaction: t, include: { model: User, as: 'user' } });
    const toAcc = await Account.findByPk(toAccountId, { transaction: t, include: { model: User, as: 'user' } });

    if (!fromAcc || !toAcc) {
      await t.rollback();
      return { status: false, message: 'Один из счетов не найден' };
    }
    if (fromAcc.block_status || toAcc.block_status) {
      await t.rollback();
      return { status: false, message: 'Один из счетов заморожен' };
    }

    const isPincodeValid = await bcrypt.compare(pincode, fromAcc.pincode);
    if (!isPincodeValid) {
      await t.rollback();
      return { status: false, message: 'Неверный пинкод' };
    }
    // Если отправитель НЕ root и у него не хватает денег — отменяем транзакцию
if (fromAcc.user_login !== 'root' && parseFloat(fromAcc.balance) < numericAmount) {
  await t.rollback();
  return { status: false, message: 'Недостаточно средств' };
}



    // Проводим списание и зачисление
    fromAcc.balance = parseFloat(fromAcc.balance) - numericAmount;
    toAcc.balance = parseFloat(toAcc.balance) + numericAmount;

    await fromAcc.save({ transaction: t });
    await toAcc.save({ transaction: t });
    await t.commit();

    // Записываем лог в базу данных
    await TransactionHistory.create({ type: 'TRANSFER', from_account_id: fromAccountId, to_account_id: toAccountId, amount: numericAmount, status: 'SUCCESS' });

    // =========================================================================
    // 🔥 ГЕНЕРАЦИЯ ФИЗИЧЕСКОГО ТЕКСТОВОГО ЧЕКА В ПАПКУ /logs/transfer/
    // =========================================================================
    const fs = require('fs');
    const path = require('path');

    // Получаем текущую дату и время
    const now = new Date();
    const dateDirName = now.toISOString().split('T')[0]; // Формат: ГГГГ-ММ-ДД
    const timeFileName = now.toLocaleTimeString('ru-RU').replace(/:/g, '-'); // Формат: ЧЧ-ММ-СС

    // Логины пользователей (если у root нет имени, подставим логин)
    const user1 = fromAcc.user ? fromAcc.user.user_name : 'unknown';
    const user2 = toAcc.user ? toAcc.user.user_name : 'unknown';

    // Формируем путь: /logs/transfer/[дата]/
    const logDir = path.join(__dirname, '../logs/transfer', dateDirName);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true }); // Создаем рекурсивно папки, если их нет
    }

    // Имя файла: [пользователь1]-[пользователь2]-[время].txt
    const fileName = `${user1}-${user2}-${timeFileName}.txt`;
    const fullLogPath = path.join(logDir, fileName);

    // Содержимое чека
    const receiptContent = `
==================================================
              БАНКОВСКИЙ ЧЕК ТРАНЗАКЦИИ            
==================================================
Дата операции:     ${now.toLocaleDateString('ru-RU')}
Время операции:    ${now.toLocaleTimeString('ru-RU')}
Статус проводки:   УСПЕШНО (SUCCESS)
--------------------------------------------------
ОТПРАВИТЕЛЬ:
Игрок:             ${user1}
Счет списания:     #${fromAccountId}
Остаток баланса:   ${fromAcc.balance} руб.
--------------------------------------------------
ПОЛУЧАТЕЛЬ:
Игрок:             ${user2}
Счет зачисления:   #${toAccountId}
--------------------------------------------------
ФИНАНСОВЫЕ ДАННЫЕ:
Сумма перевода:    ${numericAmount.toFixed(2)} руб.
Комиссия банка:    0.00 руб.
==================================================
          Спасибо, что пользуетесь Game-Bank!      
==================================================
`;

    // Записываем файл на диск ноутбука
    fs.writeFileSync(fullLogPath, receiptContent, 'utf-8');
    console.log(`[Чек создан] Сохранен файл лога: ${fullLogPath}`);

    // 🔥 ТРИГГЕР ПОЧТЫ: Отправляем уведомления с прикрепленным текстовым файлом
    if (fromAcc.user) {
      sendBalanceNotification(fromAcc.user.gmail, fromAcc.user.user_name, fromAcc.id, `Перевод на счет #${toAccountId}`, numericAmount, fromAcc.balance, fullLogPath);
    }
    if (toAcc.user) {
      sendBalanceNotification(toAcc.user.gmail, toAcc.user.user_name, toAcc.id, `Входящий перевод со счета #${fromAccountId}`, numericAmount, toAcc.balance, fullLogPath);
    }

    return { status: true, message: 'Перевод успешно выполнен. Чек отправлен на почту.' };
  } catch (err) {
    await t.rollback();
    return { status: false, statusCode: -1, message: err.message };
  }
}


async function getTotalUserBalance(userName) {
  try {
    // 🔥 ЕСЛИ ЭТО ROOT — В ШАПКЕ ВСЕГДА БУДЕТ БЕСКОНЕЧНОСТЬ
    if (userName === 'root') {
      return { status: true, totalBalance: 'Infinity' };
    }

    const total = await Account.sum('balance', { where: { user_login: userName } });
    return { status: true, totalBalance: total || 0.00 };
  } catch (err) {
    return { status: false, statusCode: -1, message: err.message };
  }
}


async function getAccountLogs(accountId) {
  try {
    const { Op } = require('sequelize');
    const logs = await TransactionHistory.findAll({
      where: { [Op.or]: [{ from_account_id: accountId }, { to_account_id: accountId }] },
      order: [['createdAt', 'DESC']]
    });
    return { status: true, history: logs };
  } catch (err) {
    return { status: false, message: err.message };
  }
}

async function autoAccrueInterest() {
  const t = await sequelize.transaction();
  try {
    const activeAccounts = await Account.findAll({
      where: { block_status: false, balance: { [sequelize.Sequelize.Op.gt]: 0 } },
      transaction: t,
      include: { model: User, as: 'user' }
    });

    for (const acc of activeAccounts) {
      const currentBalance = parseFloat(acc.balance);
      const interestAmount = parseFloat((currentBalance * 0.01).toFixed(2));

      if (interestAmount > 0) {
        acc.balance = currentBalance + interestAmount;
        await acc.save({ transaction: t });

        await TransactionHistory.create({ type: 'DEPOSIT', to_account_id: acc.id, amount: interestAmount, status: 'SUCCESS', details: 'Ежеминутные проценты (+1%)' }, { transaction: t });

        if (acc.user) {
          sendBalanceNotification(acc.user.gmail, acc.user.user_name, acc.id, 'Пассивный доход банка (+1%)', interestAmount, acc.balance);
        }
      }
    }
    await t.commit();
    if (activeAccounts.length > 0) console.log(`[${new Date().toLocaleTimeString()}] Проценты начислены на ${activeAccounts.length} счетов.`);
  } catch (err) {
    await t.rollback();
    console.error('Ошибка начисления процентов:', err.message);
  }
}

module.exports = { createAccount, deleteAccount, getBalance, blockAccount, unblockAccount, increaseFunds, decreaseFunds, transferFunds, getTotalUserBalance, getAccountLogs, autoAccrueInterest };
