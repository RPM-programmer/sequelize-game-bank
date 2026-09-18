const bank = require('./index.js'); // Путь к коду модуля выше

async function main() {
  try {
    const app = bank.server.init();
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Модуль банка запущен вручную из главного файла на порту ${PORT}`);
    });

  } catch (error) {
    console.error("Ошибка ручного запуска проекта:", error);
  }
}

main();
