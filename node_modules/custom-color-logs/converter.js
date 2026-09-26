require("./setupEnv.js"); //
require("dotenv").config(); //
const { safeChalk } = require("./utils.js"); // Подключаем общую утилиту

const safeColor = (rawColorName, text) => {
    // Используем уже готовую логику safeChalk для CamelCase и валидации
    return safeChalk(rawColorName, text);
};

module.exports = {
    safeColor,
    SERVER: safeColor(process.env.SERVER_TEXT_COLOR, process.env.SERVER_TEXT), //
    SOCKET: safeColor(process.env.SOCKET_TEXT_COLOR, process.env.SOCKET_TEXT), //
    WRITTER: safeColor(process.env.WRITTER_TEXT_COLOR, process.env.WRITTER_TEXT), //
    DATABASE: safeColor(process.env.DATABASE_TEXT_COLOR, process.env.DATABASE_TEXT), //
    NODEMAILER: safeColor(process.env.NODEMAILER_TEXT_COLOR, process.env.NODEMAILER_TEXT), //
    INFO: safeColor(process.env.INFO_COLOR, process.env.INFO), //
    ERROR: safeColor(process.env.ERROR_COLOR, process.env.ERROR), //
    WARN: safeColor(process.env.WARNING_COLOR, process.env.WARNING), //
    MODULES: safeColor(process.env.MODULES_TEXT_COLOR, process.env.MODULES_TEXT), //
    AND: safeColor(process.env.AND_COLOR, process.env.AND), //
    TO: safeColor(process.env.TO_COLOR, process.env.TO), //
    MODULE_NAME: safeColor(process.env.MODULE_TEXT_COLOR, process.env.MODULE_TEXT), //
    CUSTOM_START_MESSAGE: safeColor(process.env.COLOR, process.env.CUSTOM_MODULE_START_MESSAGE), //
    FUNCTION_INFO: safeColor(process.env.FUNCTION_INFO_COLOR , process.env.FUNCTION_INFO), //
    FUNCTION_STATUS: safeColor(process.env.STATUS_COLOR , process.env.STATUS), //
    LOG: safeColor(process.env.LOG_COLOR, process.env.LOG), //
    POSITIVE: safeColor(process.env.POSITIVE_COLOR, process.env.POSITIVE), //
    NEGATIVE: safeColor(process.env.NEGATIVE_COLOR, process.env.NEGATIVE), //
    NEGATIVE_SEND: safeColor(process.env.NEGATIVE_SEND_COLOR, process.env.NEGATIVE_SEND), //
    POSITIVE_SEND: safeColor(process.env.POSITIVE_SEND_COLOR, process.env.POSITIVE_SEND), //
};
