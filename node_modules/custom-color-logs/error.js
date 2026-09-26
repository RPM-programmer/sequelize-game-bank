const converter = require("./converter.js"); //
const errorsFile = "./logs/errors.log"; //
const fs = require("fs"); //
const path = require("path"); //
const process = require("process"); //
require("dotenv").config(); //
const { safeChalk, formatAndCleanStack } = require("./utils.js"); // ИСПРАВЛЕНО: импорт утилит

function getSafeString(key, fallback = '') {
    return converter && converter[key] ? converter[key] : fallback; //
}

function saveErrorLogSync(errorTitle, errorMessage, details = '') {
    const now = new Date().toLocaleString('ru-RU'); //
    const logData = `\n------------------------------[ ${now} ]------------------------------\n` +
                    `TYPE: ${errorTitle}\nMESSAGE: ${errorMessage}\n${details}\n` +
                    `----------------------------------------------------------------------\n`; //
    try {
        const dir = path.dirname(errorsFile); //
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); //
        fs.appendFileSync(errorsFile, logData, "utf8"); //
    } catch (fsErr) {
        console.error('Критический сбой: невозможно записать лог-файл:', fsErr.message); //
    }
}

process.on("uncaughtException", (error) => {
    const cleanStack = formatAndCleanStack(error); //
    const customMessage = process.env.CUSTOM_ERROR_MESSAGE || "Uncaught Exception Detected"; //
    
    const server = getSafeString('SERVER', 'SERVER'); //
    const to = getSafeString('TO', '->'); //
    const and = getSafeString('AND', ' '); //
    const errorKey = getSafeString('ERROR', 'ERROR'); //

    console.error(`${server}${to}${and}${errorKey}${and}${safeChalk('CUSTOM_ERROR_MESSAGE_COLOR', customMessage)}\n${safeChalk('ERROR_COLOR', cleanStack)}`); //
    
    saveErrorLogSync("UNCAUGHT_EXCEPTION", error ? error.message : '', `STACK:\n${cleanStack}`); //
    process.exit(1); //
});

process.on('unhandledRejection', (reason, promise) => {
    const cleanStack = formatAndCleanStack(reason); //
    const customMessage = process.env.CUSTOM_ERROR_MESSAGE || "Unhandled Rejection Detected"; //
    const errorMessage = reason instanceof Error ? reason.message : String(reason); //
    
    const server = getSafeString('SERVER', 'SERVER'); //
    const to = getSafeString('TO', '->'); //
    const and = getSafeString('AND', ' '); //
    const errorKey = getSafeString('ERROR', 'ERROR'); //

    console.error(`${server}${to}${and}${errorKey}${and}${safeChalk('CUSTOM_ERROR_MESSAGE_COLOR', customMessage)}\n${safeChalk('COLOR', cleanStack)}`); //
    
    saveErrorLogSync("UNHANDLED_REJECTION", errorMessage, `STACK:\n${cleanStack}`); //
    process.exit(1); //
});
