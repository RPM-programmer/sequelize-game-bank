const path = require("path");
const Account = require(path.join(__dirname, '..', '..', 'models', 'Account'));
const logger = require("custom-color-logs").print;
module.exports = async function linkACard(card, id, pin_code) {
    try {
        const account = await Account.findByPk(id);
        if (!account) return { status: false, statusCode: -2, message: "?¿?" };
        if(!account.active) return { status: false, statusCode: -11, message: 'Один из счетов заблокирован' };
        if (account.pin_code !== pin_code) return { status: false, statusCode: -23, message: "Неправильны пароль!" };
        if (account.cardNumber !== null) return { status: false, statusCode: -19, message: "Карты уже привязана" };
        account.cardNumber = card;
        await account.save();
        return {status: true, statusCode: 1, message: 'Привязка карты удалась'};
    } catch (err) {
        console.log(logger.BankError(err));
        return { status: false, statusCode: -10, message: err.message };
    }
}