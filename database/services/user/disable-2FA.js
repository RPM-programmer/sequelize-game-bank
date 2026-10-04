const User = require('../../models/User');
const { sendBotNotification } = require('../bot/bot');

module.exports = async function disable2FA(name) {
  try {
    const user = await User.findByPk(name);
    if (!user) return { status: false, statusCode: -2 };
    
    user.two_fa_status = false;
    user.two_fa_token = null;
    await user.save();
    
    await sendBotNotification('disable-2FA-bot', { name });
    return { status: true, statusCode: 1 };
  } catch { return { status: false, statusCode: -10 }; }
};
