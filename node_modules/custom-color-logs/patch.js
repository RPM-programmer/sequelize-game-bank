require("dotenv").config(); //
const process = require("process"); //
const chalk = require("chalk-palette"); //
const { safeChalk } = require("./utils.js"); // Используем стандартизированный метод

function getSafeColorMethod(envValue, defaultColor) {
    if (!envValue) return defaultColor; //
    const clean = envValue.replace(/;/g, '').trim().toLowerCase(); //
    if (!clean) return defaultColor; //
    const formattedColor = clean.charAt(0).toUpperCase() + clean.slice(1); //
    return typeof chalk[formattedColor] === 'function' ? formattedColor : defaultColor; //
}

global.customColorizeOutput = function colorizeOutput(obj, keyColor, valueColor) {
    if (typeof obj === 'string') {
        return typeof chalk[valueColor] === 'function' ? chalk[valueColor](`"${obj}"`) : `"${obj}"`; //
    }
    if (typeof obj !== 'object' || obj === null) {
        return typeof chalk[valueColor] === 'function' ? chalk[valueColor](String(obj)) : String(obj); //
    }
    if (Array.isArray(obj)) {
        const items = obj.map(item => global.customColorizeOutput(item, keyColor, valueColor)).join(', '); //
        return `[ ${items} ]`; //
    }
    const properties = Object.keys(obj).map(key => {
        const formattedKey = typeof chalk[keyColor] === 'function' ? chalk[keyColor](key) : key; //
        const formattedValue = global.customColorizeOutput(obj[key], keyColor, valueColor); //
        return `${formattedKey}: ${formattedValue}`; //
    });
    return `{ ${properties.join(', ')} }`; //
};

if (process.env.SHOW_TIME_AT_LOG === "true") {
    const originalLog = console.log; //
    console.log = function (...args) {
        const time = new Date().toLocaleTimeString(); //
        const timeColor = getSafeColorMethod(process.env.TIME_COLOR, 'White'); //
        const textColor = getSafeColorMethod(process.env.COLOR, 'Gray'); //
        const keyColor = getSafeColorMethod(process.env.KEY_COLOR, 'Yellow'); //
        const valueColor = getSafeColorMethod(process.env.VALUE_COLOR, 'Green'); //
        
        const paintTime = typeof chalk[timeColor] === 'function' ? chalk[timeColor](`[${time}]`) : `[${time}]`; //
        
        // ВРЕМЕННО ОТКЛЮЧАЕМ ПЕРЕХВАТ, чтобы избежать Maximum Call Stack, 
        // если внутри customColorizeOutput что-то пойдет не так
        const tempLog = console.log;
        console.log = originalLog;

        const formattedArgs = args.map(arg => {
            if (typeof arg === 'string') {
                const cleanStr = arg.replace(/[\u001b\x1b]\[[0-9;]*m/g, ''); //
                if (cleanStr.startsWith('SYSTEM:') || cleanStr.startsWith('NODE:')) {
                    return arg; //
                }
                return typeof chalk[textColor] === 'function' ? chalk[textColor](arg) : arg; //
            }
            return global.customColorizeOutput(arg, keyColor, valueColor); //
        }).join(' ');
        
        originalLog.call(console, `${paintTime} ${formattedArgs}`); //
        
        // Возвращаем перехват обратно
        console.log = tempLog;
    };
}
