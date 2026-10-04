module.exports = {
  registerUser: require('./user/create'),
  deleteUser: require('./user/delete'),
  changePassword: require('./user/change-password'),
  login: require('./user/login'),
  mathManny: require('./user/math-manny'),
  enable2FA: require('./user/enable-2FA'),
  disable2FA: require('./user/disable-2FA'),
  changeGmail: require('./user/change-gmail'),
  changeAvatar: require('./user/change-avatar')
};
