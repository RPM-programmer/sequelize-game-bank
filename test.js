// test.js
const initBankModule = require('./index.js');

async function start() {
  try {
    // 🔑 ДОБАВЛЯЕМ await, чтобы получить чистый app, а не Promise
    const app = await initBankModule(); 
    
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`🚀 [City-bank] Веб-сервер успешно запущен из test.js на порту ${PORT}`);
    });
    
  } catch (error) {
    console.error("🔴 Ошибка при запуске модуля банка:", error.message);
  }
}

// Запускаем нашу асинхронную функцию
start();
