const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require("bcrypt");
const User = sequelize.define('user', {
  user_name: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Имя пользователя не может быть пустым' },
      len: { args:[3, 30], msg: 'Имя пользователя должно быть от 3 до 30 символов' }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gmail: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: { msg: 'Некорректный формат email адреса' }
    }
  }
}, {
  hooks: {
    // Безопасность: защита системного администратора root от удаления
    beforeDestroy: (user) => {
      if (user.user_name === 'root') {
        throw new Error('Удаление суперпользователя "root" строго запрещено!');
      }
    },
    beforeBulkDestroy: (options) => {
      if (!options.where || options.where.user_name === 'root' || !options.where.user_name) {
        throw new Error('Массовое удаление заблокировано для защиты аккаунта "root"!');
      }
    }
  }
});

(async ()=>{
  const rootPasswordHash = await bcrypt.hash('bank-root', 10);
    await User.findOrCreate({
      where: { user_name: 'root' },
      defaults: { password: rootPasswordHash, gmail: 'admin@bank.com' }
    });
})();


module.exports = User;
