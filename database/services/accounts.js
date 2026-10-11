const path = require("path");
module.exports = {
  create: require(path.join(__dirname, 'account', 'create')),
  delete: require(path.join(__dirname, 'account', 'delete')),
  changePincode: require(path.join(__dirname, 'account', 'change-pincode')),
  transfer: require(path.join(__dirname, 'account', 'transfer')),
  addManny: require(path.join(__dirname, 'account', 'add-manny')),
  removeManny: require(path.join(__dirname, 'account', 'remove-manny')),
  findManny: require(path.join(__dirname, 'account', 'find-manny')),
  creatCredit: require(path.join(__dirname, 'account', 'create-credit')),
  getLogs: require(path.join(__dirname, 'account', 'logs')),
  changeAccountStatus: require(path.join(__dirname, 'account', 'change-status')) 
};
