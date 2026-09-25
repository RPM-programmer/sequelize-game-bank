const bcrypt = require('bcrypt');
const User = require('../../models/User');

module.exports = async function deleteUser(name, password, totp = null) {
  try {
    const user = await User.findByPk(name);
    if (!user || !(await bcrypt.compare(password, user.password))) return { status: false, statusCode: -2 };
    
    if (user.two_fa_status) {
      if (!totp || !(await bcrypt.compare(totp, user.two_fa_token))) return { status: false, statusCode: -2 };
    }
    await user.destroy();
    return { status: true, statusCode: 1 };
  } catch { return { status: false, statusCode: -10 }; }
};
