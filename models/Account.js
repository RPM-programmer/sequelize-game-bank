const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User'); // Импортируем пользователя для настройки связей

const Account = sequelize.define('account', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  user_login: { 
    type: DataTypes.STRING,
    allowNull: false,
    references: { model: User, key: 'user_name' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: { args:[0], msg: 'Баланс счета не может быть отрицательным' }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  block_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

// =========================================================================
// НАСТРОЙКА СВЯЗЕЙ «ОДИН КО МНОГИМ» (Один Юзер -> Много Счетов)
// =========================================================================

// 1. У одного пользователя может быть много счетов
User.hasMany(Account, { 
  foreignKey: 'user_login', 
  sourceKey: 'user_name' 
});

// 2. Каждый счет жестко принадлежит одному пользователю (алиас 'user')
Account.belongsTo(User, { 
  foreignKey: 'user_login', 
  targetKey: 'user_name', 
  as: 'user' // ➡️ Этот алиас позволяет писать { include: 'user' }
});
// Перед тем как делать app.listen(3000, ...)
sequelize.sync()
  .then(() => {
    console.log('База данных успешно синхронизирована (таблицы созданы/проверены)');
  })
  .catch(err => console.error('Ошибка синхронизации БД:', err));


module.exports = Account;
