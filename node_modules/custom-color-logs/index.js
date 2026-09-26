require("./patch.js"); 

const process = require("process"); 
const converter = require("./converter.js"); 
require("dotenv").config(); 

const { safeChalk, bypassResetCode } = require("./utils.js");

function getSafeString(key, fallback = '') {
    return converter && converter[key] ? converter[key] : fallback; 
}

function stringifyArg(arg, keyColor, valueColor) {
    if (typeof arg === 'string') return arg; 
    if (typeof arg === 'object' && arg !== null) {
        try {
            if (global.customColorizeOutput) {
                return global.customColorizeOutput(arg, keyColor, valueColor); 
            }
            return JSON.stringify(arg); 
        } catch {
            return String(arg); 
        }
    }
    return String(arg); 
}

// Утилитный класс для сборки строки лога на лету
class LogBuilder {
    static buildPrefix(componentName) {
        const to = getSafeString('TO', ':'); 
        const and = getSafeString('AND', ' '); 
        const rawSystem = process.env.PREFIX_TEXT || 'SYSTEM'; 
        const systemColor = process.env.PREFIX_TEXT_COLOR || 'Blue'; 
        const system = typeof converter.safeColor === 'function' 
            ? converter.safeColor(systemColor, rawSystem) 
            : rawSystem; 

        const serverText = getSafeString('SERVER', 'SERVER'); 

        // Разделяем CamelCase строку на подкомпоненты (например, "ServerBot" -> ["Server", "Bot"])
        const subComponents = componentName.match(/[A-Z][a-z0-9]*/g) || [componentName];

        // Читаем глобальные настройки для кастомных префиксов
        const customColor = process.env.CUSTOM_PREFIX_TEXT_COLOR || 'Cyan';
        const customCase = (process.env.CUSTOM_PREFIX_TEXT_CASE || 'Upper').toLowerCase();

        let formattedComponents = subComponents.map(sub => {
            // Форматируем регистр в зависимости от настроек в .env
            let processedText = sub;
            if (customCase === 'upper') processedText = sub.toUpperCase();
            if (customCase === 'lower') processedText = sub.toLowerCase();

            const upperKey = sub.toUpperCase();
            
            // Проверяем, зашит ли этот компонент жестко в .env (например, DATABASE_TEXT)
            const envValue = process.env[`${upperKey}_TEXT`] || process.env[upperKey];
            const envColor = process.env[`${upperKey}_TEXT_COLOR`] || process.env[`${upperKey}_COLOR`];

            // Если компонент "родной" (есть в .env) — используем его настройки
            if (envValue) {
                return typeof converter.safeColor === 'function' && envColor
                    ? converter.safeColor(envColor, envValue)
                    : envValue;
            }

            // Если компонент кастомный (динамический) — красим в единый кастомный цвет
            return typeof converter.safeColor === 'function'
                ? converter.safeColor(customColor, processedText)
                : processedText;
        });

        // Защита от дублирования базового SERVER префикса
        if (formattedComponents.length > 0) {
            const firstClean = formattedComponents[0].replace(/[\u001b\x1b]\[[0-9;]*m/g, '').toUpperCase();
            const serverClean = serverText.replace(/[\u001b\x1b]\[[0-9;]*m/g, '').toUpperCase();

            if (firstClean === serverClean) {
                formattedComponents.shift(); // Удаляем дублирующийся первый элемент
            }
        }

        // Если после удаления ничего не осталось, возвращаем базовый префикс системы
        if (formattedComponents.length === 0) {
            return bypassResetCode(`${system}${to}${serverText}${to}${and}`); 
        }

        // Склеиваем префиксы через разделитель (например, SYSTEM:SERVER:REDIS:KAFKA:)
        const componentsString = formattedComponents.join(to);
        return bypassResetCode(`${system}${to}${serverText}${to}${componentsString}${to}${and}`); 
    }

    static parseArgs(args) {
        const kColor = process.env.KEY_COLOR || 'Yellow'; 
        const vColor = process.env.VALUE_COLOR || 'Green'; 
        return args.map(arg => stringifyArg(arg, kColor, vColor)).join(' '); 
    }
}




// Карта базовых методов и соответствующих им настроек из .env
const METHOD_ROUTING = {
    Info: { tagKey: 'INFO', defaultTag: 'INFO', colorEnv: 'COLOR' },
    Warn: { tagKey: 'WARN', defaultTag: 'WARN', colorEnv: 'WARNING_COLOR' },
    Error: { tagKey: 'ERROR', defaultTag: 'ERROR', colorEnv: 'ERROR_COLOR', isError: true },
    FunctionInfo: { tagKey: 'FUNCTION_INFO', defaultTag: 'FUNC_INFO', colorEnv: 'CUSTOM_TEXT_TO_FUNCTION_COLOR', hasFuncName: true },
    FunctionPrint: { tagKey: 'LOG', defaultTag: 'LOG', colorEnv: 'CUSTOM_TEXT_TO_FUNCTION_COLOR', hasFuncName: true },
    FunctionStatus: { tagKey: 'FUNCTION_STATUS', defaultTag: 'FUNC_STATUS', colorEnv: 'CUSTOM_TEXT_TO_FUNCTION_COLOR', hasFuncName: true, appendStatus: true },
    FunctionPositivePerformance: { tagKey: 'POSITIVE', defaultTag: 'OK', colorEnv: 'COLOR', hasFuncName: true, isPerf: true, perfColorKey: 'PNAME_COLOR' },
    FunctionNegativePerformance: { tagKey: 'NEGATIVE', defaultTag: 'FAIL', colorEnv: 'COLOR', hasFuncName: true, isPerf: true, perfColorKey: 'NNAME_COLOR' }
};

// Базовый объект для обратной совместимости хардкодных методов
const basePrint = {
    NodemailerFunctionPositiveSending(gmail) {
        const label = `Gmail - ${gmail}`; 
        const coloredLabel = safeChalk('GMAIL_COLOR', label); 
        const prefix = bypassResetCode(`${getSafeString('SERVER', 'SERVER')}${getSafeString('TO', '->')}${getSafeString('NODEMAILER', 'NODEMAILER')}${getSafeString('TO', '->')}${getSafeString('AND', ' ')}${getSafeString('POSITIVE_SEND', 'SEND_OK')}${getSafeString('AND', ' ')}`); 
        return `${prefix}${coloredLabel}`; 
    },
    NodemailerFunctionNegativeSending(gmail) {
        const label = `Gmail - ${gmail}`; 
        const coloredLabel = safeChalk('GMAIL_COLOR', label); 
        const prefix = bypassResetCode(`${getSafeString('SERVER', 'SERVER')}${getSafeString('TO', '->')}${getSafeString('NODEMAILER', 'NODEMAILER')}${getSafeString('TO', '->')}${getSafeString('AND', ' ')}${getSafeString('NEGATIVE_SEND', 'SEND_FAIL')}${getSafeString('AND', ' ')}`); 
        return `${prefix}${coloredLabel}`; 
    }
};

// Магический Proxy логгера
const print = new Proxy(basePrint, {
    get(target, prop) {
        if (prop in target) {
            return target[prop];
        }

        const matchedMethod = Object.keys(METHOD_ROUTING).find(method => prop.endsWith(method));

        if (!matchedMethod) {
            return () => '';
        }

        const componentName = prop.slice(0, prop.length - matchedMethod.length);
        const config = METHOD_ROUTING[matchedMethod];

        return (...args) => {
            const and = getSafeString('AND', ' '); 
            const prefix = LogBuilder.buildPrefix(componentName);
            const tag = getSafeString(config.tagKey, config.defaultTag);

            let prefixAndTag = bypassResetCode(`${prefix}${tag}${and}`);
            let text = '';

            if (config.hasFuncName) {
                const [funName, ...restArgs] = args;
                const funcColorKey = config.isPerf ? config.perfColorKey : 'NAME_FUNCTION_COLOR';
                const funcTag = config.isPerf ? safeChalk(funcColorKey, funName) : safeChalk(funcColorKey, `[-${funName}-]`);
                
                const statusStr = config.appendStatus ? `status${and}` : '';
                prefixAndTag = bypassResetCode(`${prefix}${tag}${and}${funcTag}${and}${statusStr}`);
                text = LogBuilder.parseArgs(restArgs);
            } else if (config.isError) {
                const firstArg = args[0];
                text = (firstArg && firstArg.message) ? firstArg.message : LogBuilder.parseArgs(args);
            } else {
                text = LogBuilder.parseArgs(args);
            }

            const coloredText = safeChalk(config.colorEnv, text); 
            return `${prefixAndTag}${coloredText}`; 
        };
    }
});

module.exports = { print }; 

require("./logs.js"); 
require("./error.js");
