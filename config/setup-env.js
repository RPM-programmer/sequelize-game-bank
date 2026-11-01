const fs = require("fs");
const path = require("path");
const process = require("process");
const envPath = path.resolve(process.cwd(), ".env");
const logger = require("custom-color-logs").print;
const defaultEnvContent = `
# ==============================================================================
# sequelize-game-bank v5.0.0
# ==============================================================================

# тег инициализации 
SEQUELIZE_GAME_BANK_INITIALIZED              = true

# токен который будет зашиваться в cooki
JWT_SECRET                                   = "0000"

# пароль от аккаунта админестратора
ROOT_PASSWORD                                = "bank-root"

# почта админестратора
GMAIL                                        = "example@gmail.com"

# пароль от приложения gmail
GOOGLE_APP_PASSWORD                          = "abcd efgh ijkl mnop"

# интервал проверки кредита
CRON_CREDIT_INTERVAL_MINUTES                 = 5

`;
function initializeEnvironment() {
  try {
    if (!fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, defaultEnvContent, "utf8");
    } else {
      const currentEnv = fs.readFileSync(envPath, "utf8");
      if (currentEnv.includes("SEQUELIZE_GAME_BANK_INITIALIZED")) {
        require("dotenv").config({ path: envPath });
        return;
      }
      fs.appendFileSync(envPath, `\n\n${defaultEnvContent}`, "utf8");
    }
  } catch (err) {
    console.log(
      logger.ServerError(
        "Не удалось проверить или обновить .env:",
        err.message,
      ),
    );
  }
  require("dotenv").config({ path: envPath });
}
initializeEnvironment();
module.exports = { envPath };
