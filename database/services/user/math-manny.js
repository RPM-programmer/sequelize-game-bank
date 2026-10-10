const path = require("path");
const Account = require(path.join(__dirname, '..', '..', 'models', 'Account'));
module.exports = async function mathManny(username) {
  try {
    const total = await Account.sum('manny', { where: { user: username } });
    return { status: true, statusCode: 1, totalManny: parseFloat(total) || 0.00 };
  } catch { return { status: false, statusCode: -10 }; }
};