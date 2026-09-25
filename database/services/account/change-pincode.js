const bcrypt = require('bcrypt');
const Account = require('../../models/Account');

module.exports = async function changePincode(accountId, oldPin, newPin) {
  try {
    const acc = await Account.findByPk(accountId);
    if (!acc) return { status: false, statusCode: -2, message: 'Счет не найден' };

    const isPinValid = await bcrypt.compare(oldPin, acc.pin_code);
    if (!isPinValid) return { status: false, statusCode: -2, message: 'Неверный текущий пин-код' };

    if (!newPin || newPin.length > 8) {
      return { status: false, statusCode: -2, message: 'Новый пин-код должен быть до 8 символов' };
    }

    acc.pin_code = await bcrypt.hash(newPin, 10);
    await acc.save();

    return { status: true, statusCode: 1 };
  } catch (err) {
    return { status: false, statusCode: -10 };
  }
};
