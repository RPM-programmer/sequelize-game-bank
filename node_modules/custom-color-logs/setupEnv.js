const fs = require('fs');
const path = require('path');
const process = require('process');

// Определяем путь к .env файлу в корне проекта пользователя
const envPath = path.resolve(process.cwd(), '.env');

// Дефолтный блок настроек с уникальным маркером безопасности
const defaultEnvContent = `

# ==============================================================================
# 🎨 CUSTOM-COLOR-LOGS CONFIGURATION (v3.0.0)
# ==============================================================================
CUSTOM_COLOR_LOGS_INITIALIZED                = true

# ⚙️ ОСНОВНЫЕ СИСТЕМНЫЕ НАСТРОЙКИ
# ------------------------------------------------------------------------------
SHOW_START_LOG                               = true
SHOW_MODULE_LOGS                             = true
SHOW_END_LOG                                 = true
SHOW_TIME_AT_LOG                             = true

# 🧩 СИСТЕМНЫЕ СВЯЗУЮЩИЕ ЗНАКИ И ЦВЕТА
# ------------------------------------------------------------------------------
AND                                          = " "
AND_COLOR                                    = Black
TO                                           = ":"
TO_COLOR                                     = Blue

# 🖌️ НАСТРОЙКА УМНОГО ОКРАШИВАНИЯ СТРОК И ОБЪЕКТОВ (ФИЧА v3.0.0)
# ------------------------------------------------------------------------------
COLOR                                        = Gray     # Цвет для обычного Info текста
TIME_COLOR                                   = White    # Цвет времени [12:00:00]
KEY_COLOR                                    = Magenta  # Цвет ключей объектов (например, name, id)
VALUE_COLOR                                  = Yellow   # Цвет значений (например, "Иван", 777)

# 📢 ГЛОБАЛЬНЫЕ СТАТУСНЫЕ ТЕГИ И ЦВЕТА СоОБЩЕНИЙ
# ------------------------------------------------------------------------------
INFO                                         = "@info"
INFO_COLOR                                   = Blue
WARNING                                      = "@warn"
WARNING_COLOR                                = Orange
ERROR                                        = "@error"
ERROR_COLOR                                  = Red

# 🚨 КРИТИЧЕСКИЕ ОШИБКИ И ПЕРЕХВАТЧИКИ PROCESS
# ------------------------------------------------------------------------------
CUSTOM_ERROR_MESSAGE                         = "Error!"
CUSTOM_ERROR_MESSAGE_COLOR                   = Orange
ERROR_STACK_COLOR                            = Red      # Название переменной для safeChalk в Error

# 📦 НАСТРОЙКИ ДЛЯ ЛОГИРОВАНИЯ ВНУТРЕННИХ ФУНКЦИЙ
# ------------------------------------------------------------------------------
FUNCTION_INFO                                = "@function-info"
FUNCTION_INFO_COLOR                          = Blue
NAME_FUNCTION_COLOR                          = Lime     # Цвет скобок функции [-authCheck-]
CUSTOM_TEXT_TO_FUNCTION_COLOR                = Gray     # Цвет описания работы функции
LOG                                          = "@function-log"
LOG_COLOR                                    = Blue
STATUS                                       = "@function-status"
STATUS_COLOR                                 = Blue

# 📈 МЕТРИКИ ПРОИЗВОДИТЕЛЬНОСТИ (PERFORMANCE)
# ------------------------------------------------------------------------------
POSITIVE                                     = "@function-positive-performance"
POSITIVE_COLOR                               = Green
PNAME_COLOR                                  = Lime
NEGATIVE                                     = "@function-negative-performance"
NEGATIVE_COLOR                               = Orange
NNAME_COLOR                                  = Lime

# ✉️ СЕРВИС ОТПРАВКИ ПОЧТЫ (NODEMAILER)
# ------------------------------------------------------------------------------
POSITIVE_SEND                                = "@send-status-true"
POSITIVE_SEND_COLOR                          = Green
NEGATIVE_SEND                                = "@send-status-false"
NEGATIVE_SEND_COLOR                          = Orange
GMAIL_COLOR                                  = Lime

# 🏗️ ИЕРАРХИЯ ПРЕФИКСОВ (КОМПОНЕНТЫ И МОДУЛИ)
# ------------------------------------------------------------------------------
PREFIX_TEXT                                  = "SYSTEM"
PREFIX_TEXT_COLOR                            = Blue

SERVER_TEXT                                  = "SERVER"
SERVER_TEXT_COLOR                            = Blue
SOCKET_TEXT                                  = "SOCKET"
SOCKET_TEXT_COLOR                            = Blue
WRITTER_TEXT                                 = "WRITTER"
WRITTER_TEXT_COLOR                           = Blue
DATABASE_TEXT                                = "DATABASE"
DATABASE_TEXT_COLOR                          = Green
NODEMAILER_TEXT                              = "NODEMAILER"
NODEMAILER_TEXT_COLOR                        = Purple

MODULES_TEXT                                 = "NODE-MODULES"
MODULES_TEXT_COLOR                           = Lime
MODULE_TEXT                                  = "[ LOGGER ]"
MODULE_TEXT_COLOR                            = SkyBlue

# 🎨 НАСТРОЙКА ДЛЯ ЛЮБЫХ КАСТОМНЫХ ПРЕФИКСОВ (Фича v3.0.0)
# ------------------------------------------------------------------------------
CUSTOM_PREFIX_TEXT_COLOR                     = Cyan     # Цвет для всех динамических префиксов (Redis, Telegram и т.д.)
CUSTOM_PREFIX_TEXT_CASE                      = Upper    # Регистр: Upper (по умолчанию), Lower или AsIs (как в коде)

# 🚀 СТАРТОВЫЕ И ФИНАЛЬНЫЕ СООБЩЕНИЯ МОДУЛЕЙ
# ------------------------------------------------------------------------------
CUSTOM_MODULE_START_MESSAGE                  = "Code is ran!"
CUSTOM_MODULES_START_MESSAGE                 = "Module is ran!"
CUSTOM_MODULES_START_MESSAGE_IF_ISNT_MODULES = "No active neighbor modules found."
CUSTOM_MODULES_START_MESSAGE_COLOR           = Gray
CUSTOM_MODULE_STOP_MESSAGE                   = "Code is stop!"
CUSTOM_MODULES_STOP_MESSAGE                  = "Module is stoped!"
CUSTOM_MODULES_STOP_MESSAGE_IF_ISNT_MODULES  = "No active neighbor modules found."
CUSTOM_MODULES_STOP_MESSAGE_COLOR           = Gray
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
            if (currentEnv.includes('CUSTOM_COLOR_LOGS_INITIALIZED')) {
                require("dotenv").config({ path: envPath });
                return;
            }
            
            // Если тега нет (конфиг логгера еще не добавлялся), аккуратно дописываем в конец
            fs.appendFileSync(envPath, `\n\n${defaultEnvContent}`, 'utf8');
        }
    } catch (err) {
        console.error('⚠️ [custom-color-logs] Не удалось проверить или обновить .env:', err.message);
    }

    // Загружаем обновленные или созданные переменные в process.env
    require("dotenv").config({ path: envPath });
}

initializeEnvironment();

module.exports = { envPath };