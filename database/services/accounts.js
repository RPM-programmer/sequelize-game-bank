// database/services/accounts.js
module.exports = {
  create: require('./account/create'),
  delete: require('./account/delete'),
  changePincode: require('./account/change-pincode'),
  transfer: require('./account/transfer'),
  addManny: require('./account/add-manny'),
  removeManny: require('./account/remove-manny'),
  findManny: require('./account/find-manny'),
  creatCredit: require('./account/create-credit'),
  getLogs: require('./account/logs'),
  changeAccountStatus: require('./account/change-status') 
};
