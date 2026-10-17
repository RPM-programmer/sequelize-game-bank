const path = require("path");
const User = require(path.join(__dirname, '..', '..', 'models', 'User.js'));
module.exports = async function changeAvatar(name, avatarUrl) {
  try {
    const user = await User.findByPk(name);
    if (!user) return { status: false, statusCode: -2, message: 'Пользователь не найден' };
    user.avatar = avatarUrl;
    await user.save();
    return { status: true, statusCode: 1, avatar: avatarUrl };
  } catch (err) {
    return { status: false, statusCode: -10, message: err.message };
  }
};