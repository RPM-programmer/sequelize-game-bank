const { DataTypes } = require("sequelize");
const path = require("path");
const sequelize = require(path.join(__dirname, "..", "config", "init-db.js"));
const Account = require(path.join(__dirname, "Account.js"));

const Credit = sequelize.define("credit", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  accountId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Account, key: "id" },
    onDelete: "CASCADE",
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  totalRepay: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  remainingRepay: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  termMonths: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  autoRepay: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "active",
  },
});

// Настройка связей с учетом нового имени внешнего ключа accountId
Account.hasMany(Credit, { foreignKey: "accountId" });
Credit.belongsTo(Account, { foreignKey: "accountId", as: "linkedAccount" });

module.exports = Credit;
