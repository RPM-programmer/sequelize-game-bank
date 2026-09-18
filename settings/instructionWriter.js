const fs = require('fs');
const path = require('path');
const process = require('process');
const logger = require("custom-color-logs").print;

// Определяем путь к .env файлу в корне проекта пользователя
const envPath = path.resolve(process.cwd(), 'instruction.md');

// Дефолтный блок настроек с уникальным маркером безопасности
const defaultEnvContent = `
------------------------------------------------------------------\n
-------------------- sequelize-game-bank -------------------------\n
------------------------------------------------------------------\n


`;

function initializeEnvironment() {
    try {
        if (!fs.existsSync(envPath)) {
            // Если .env файла нет совсем — создаем и записываем дефолтный конфиг с тегом
            fs.writeFileSync(envPath, defaultEnvContent, 'utf8');
        } else {
            // Если файл есть, читаем его содержимое
            const currentEnv = fs.readFileSync(envPath, 'utf8');
            
            // СТРОГАЯ ПРОВЕРКА ТЕГА: если маркер инициализации уже внутри файла, полностью выходим
            if (currentEnv.includes('sequelize-game-bank')) {
                require("dotenv").config({ path: envPath });
                return;
            }
            
            // Если тега нет (конфиг логгера еще не добавлялся), аккуратно дописываем в конец
            fs.appendFileSync(envPath, `\n\n\n\n\n\n\n\n${defaultEnvContent}`, 'utf8');
        }
    } catch (err) {
        console.error('⚠️ [sequelize-game-bank] >> [custom-color-logs] Не удалось проверить или обновить .env:', err.message);
    }

    // Загружаем обновленные или созданные переменные в process.env
    require("dotenv").config({ path: envPath });
}

initializeEnvironment();

module.exports = { envPath };