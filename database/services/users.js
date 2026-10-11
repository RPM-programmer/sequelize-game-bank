const path = require("path");
module.exports = {
  registerUser: require(path.join(__dirname, 'user', 'create')),
  deleteUser: require(path.join(__dirname, 'user', 'delete')),
  changePassword: require(path.join(__dirname, 'user', 'change-password')),
  login: require(path.join(__dirname, 'user', 'login')),
  mathManny: require(path.join(__dirname, 'user', 'math-manny')),
  enable2FA: require(path.join(__dirname, 'user', 'enable-2FA')),
  disable2FA: require(path.join(__dirname, 'user', 'disable-2FA')),
  changeGmail: require(path.join(__dirname, 'user', 'change-gmail')),
  changeAvatar: require(path.join(__dirname, 'user', 'change-avatar'))
};
