const bcrypt = require('bcrypt');
const Account = require('../../models/Account');

module.exports = async function createAccount(username, pinCode, enable2FA) {
  try {
    // Валидация длины пин-кода (до 8 символов по ТЗ)
    if (!pinCode || pinCode.length > 8) {
      return { status: false, statusCode: -2, message: 'Пин-код должен быть до 8 символов' };
    }

    const hashedPin = await bcrypt.hash(pinCode, 10);
    const newAccount = await Account.create({
      user: username,
      pin_code: hashedPin,
      manny: 0.00, // Строго нулевой баланс для игроков
      active: true,
      two_fa_status: enable2FA
    });

    return { status: true, statusCode: 1, accountId: newAccount.id };
  } catch (err) {
    return { status: false, statusCode: -10, message: err.message };
  }
};
