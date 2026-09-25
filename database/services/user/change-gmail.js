const User = require('../../models/User');

module.exports = async function changeGmail(name, newGmail) {
  try {
    if (await User.findOne({ where: { user_gmail: newGmail } })) return { status: false, statusCode: -21 };
    const user = await User.findByPk(name);
    if (!user) return { status: false, statusCode: -2 };
    
    user.user_gmail = newGmail;
    await user.save();
    return { status: true, statusCode: 1 };
  } catch { return { status: false, statusCode: -10 }; }
};
