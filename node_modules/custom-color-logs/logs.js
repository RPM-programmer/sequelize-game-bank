const path = require("path");
const fs = require("fs");
const chalk = require("chalk-palette"); // ИСПРАВЛЕНО: Добавлен импорт
const converter = require("./converter.js"); 
const { safeChalk, bypassResetCode } = require("./utils.js"); // ИСПРАВЛЕНО: Импорт из утилит

function getSafeString(key, fallback = '') {
    return converter && converter[key] ? converter[key] : fallback;
}

const shouldLog = (process.env.SHOW_MODULE_LOGS === 'true' || process.env.SHOW_START_LOG === 'true'); 

const moduleNameCache = new Map();

function getModuleNameFromFile(filePath) {
    if (moduleNameCache.has(filePath)) return moduleNameCache.get(filePath);

    let currentDir = path.dirname(filePath);
    const root = path.parse(currentDir).root;

    while (currentDir !== root) {
        const pkgPath = path.join(currentDir, 'package.json');
        if (fs.existsSync(pkgPath)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                const name = pkg.name || path.basename(currentDir);
                moduleNameCache.set(filePath, name);
                return name;
            } catch {
                const name = path.basename(currentDir);
                moduleNameCache.set(filePath, name);
                return name;
            }
        }
        currentDir = path.dirname(currentDir);
    }
    moduleNameCache.set(filePath, null);
    return null;
}

const activeModules = Object.keys(require.cache)
    .filter(filePath => filePath !== __filename)
    .map(filePath => getModuleNameFromFile(filePath))
    .filter(name => name !== null);

const uniqueModules = [...new Set(activeModules)];

function logModulesState(rawColor, activeMsg, emptyMsg) {
    const to = getSafeString('TO', ':');
    const nodePrefix = typeof converter.safeColor === 'function' ? converter.safeColor('Blue', 'NODE') : 'NODE';
    const modulesKey = getSafeString('MODULES', 'NODE-MODULES');
    const baseNodeModulesPrefix = `${nodePrefix}${to}${modulesKey}`;
    const infoKey = getSafeString('INFO', 'INFO');
    const openBracket = safeChalk('Cyan', '[');
    const closeBracket = safeChalk('Cyan', ']');

    if (uniqueModules.length === 0) {
        const coloredEmpty = converter && typeof converter.safeColor === 'function' 
            ? converter.safeColor(rawColor, emptyMsg) 
            : String(emptyMsg);
        // ИСПРАВЛЕНО: Убрана строка-призрак из функции console.log
        console.log(bypassResetCode(`${baseNodeModulesPrefix} ${infoKey} `) + coloredEmpty);
    } else {
        uniqueModules.forEach((mod) => {
            const formattedMod = `${openBracket} ${safeChalk('Cyan', mod.toUpperCase())} ${closeBracket}`;
            console.log(bypassResetCode(`${baseNodeModulesPrefix}${to}${formattedMod} ${infoKey} `) + converter.safeColor(rawColor, activeMsg));
        });
    }
}

if (shouldLog) {
    const to = getSafeString('TO', ':');
    const nodePrefix = typeof converter.safeColor === 'function' ? converter.safeColor('Blue', 'NODE') : 'NODE';
    const modulesKey = getSafeString('MODULES', 'NODE-MODULES');
    const moduleName = getSafeString('MODULE_NAME', 'LOGGER');
    const infoKey = getSafeString('INFO', 'INFO');
    const startMsg = getSafeString('CUSTOM_START_MESSAGE', 'Starting...');
    
    console.log(bypassResetCode(`${nodePrefix}${to}${modulesKey}${to}${moduleName} ${infoKey} `) + startMsg);
    logModulesState(process.env.CUSTOM_MODULES_START_MESSAGE_COLOR, process.env.CUSTOM_MODULES_START_MESSAGE, process.env.CUSTOM_MODULES_START_MESSAGE_IF_ISNT_MODULES);
}
