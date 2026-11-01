const path = require("path");
const Account = require(
  path.join(__dirname, "..", "..", "models", "Account.js"),
);
const Credit = require(path.join(__dirname, "..", "..", "models", "Credit.js"));
const sequelize = require(
  path.join(__dirname, "..", "..", "config", "init-db.js"),
);
const bcrypt = require("bcrypt");
// Функция теперь принимает аргументы по порядку, как они передаются из роутера
async function createCredit(
  username,
  accountId,
  amount,
  pinCode,
  termMonths = 12,
  autoRepay = false,
) {
  const numericAmount = parseFloat(amount);
  const numericTerm = parseInt(termMonths, 10);
  const numericRate = 0.1;
  if (!accountId || isNaN(numericAmount) || numericAmount <= 0) {
    return {
      success: false,
      error: "Некорректные параметры для создания кредита",
    };
  }
  if (isNaN(numericTerm) || numericTerm <= 0) {
    return { success: false, error: "Некорректный срок кредитования" };
  }
  if (!pinCode) {
    return {
      success: false,
      error: "Укажите PIN-код для подтверждения операции",
    };
  }

  const transaction = await sequelize.transaction();
  try {
    const account = await Account.findOne({
      where: { id: accountId },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    if (!account) throw new Error("Аккаунт не найден");

    if (account.user !== username)
      throw new Error("Нет доступа к данному счету");

    if (account.status === "blocked") throw new Error("Аккаунт заблокирован");

    const isPinValid = await bcrypt.compare(
      pinCode,
      account.pincode || account.pin_code,
    );
    if (!isPinValid) throw new Error("Неверный PIN-код");

    const existingCredit = await Credit.findOne({
      where: { accountId: account.id, status: "active" },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (existingCredit) {
      throw new Error("У этого аккаунта уже есть активный кредит");
    }

    const totalRepay = numericAmount * (1 + numericRate);

    const credit = await Credit.create(
      {
        accountId: account.id,
        amount: numericAmount,
        totalRepay: totalRepay,
        remainingRepay: totalRepay,
        status: "active",
        autoRepay: !!autoRepay,
        termMonths: numericTerm,
      },
      { transaction },
    );

    await account.increment("manny", { by: numericAmount, transaction });

    await transaction.commit();
    return {
      success: true,
      message: "Кредит успешно оформлен",
      creditId: credit.id,
    };
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    return { success: false, error: error.message };
  }
}

module.exports = createCredit;
