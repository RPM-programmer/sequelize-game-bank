const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const dbDir = path.resolve(__dirname, '../');
const dbPath = path.join(dbDir, 'citybank.db');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

try {
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    if (stats.size === 0) {
      console.warn("⚠️ [City-bank] База данных пуста или повреждена.");
    }
  }
} catch (e) {
  console.error("❌ [-101] Файл бд не найден или повреждён");
  process.exit(1);
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
  define: {
    timestamps: true
  }
});

module.exports = sequelize;
