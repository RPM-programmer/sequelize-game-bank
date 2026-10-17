const path = require("path");
module.exports = {
  create: require(path.join(__dirname, 'account', 'create.js')),
  delete: require(path.join(__dirname, 'account', 'delete.js')),
  changePincode: require(path.join(__dirname, 'account', 'change-pincode.js')),
  transfer: require(path.join(__dirname, 'account', 'transfer.js')),
  addManny: require(path.join(__dirname, 'account', 'add-manny.js')),
  removeManny: require(path.join(__dirname, 'account', 'remove-manny.js')),
  findManny: require(path.join(__dirname, 'account', 'find-manny.js')),
  creatCredit: require(path.join(__dirname, 'account', 'create-credit.js')),
  getLogs: require(path.join(__dirname, 'account', 'logs.js')),
  changeAccountStatus: require(path.join(__dirname, 'account', 'change-status.js')),
  linkACard: require(path.join(__dirname, 'account', 'linkACard.js')),
  cardTransfer: require(path.join(__dirname, 'account', 'cardTransfer.js'))
};
