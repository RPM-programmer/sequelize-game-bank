const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const { sendBotNotification } = require('../bot/bot');

module.exports = async function enable2FA(name) {
  try {
    const user = await User.findByPk(name);
    if (!user) return { status: false, statusCode: -2 };
    
    const rawSecret = crypto.randomBytes(10).toString('hex');
    user.two_fa_status = true;
    user.two_fa_token = await bcrypt.hash(rawSecret, 10);
    await user.save();
    
    await sendBotNotification('enable-2FA-bot', { name });
    return { status: true, statusCode: 1, secret2FA: rawSecret };
  } catch { return { status: false, statusCode: -10 }; }
};
