const chalk = require("chalk-palette");

function safeChalk(colorKey, text) {
    if (!text) return '';
    const colorName = process.env[colorKey] || colorKey;
    if (!colorName) return text;

    const cleanColor = colorName.replace(/;/g, '').trim().toLowerCase();
    const formattedColor = cleanColor.charAt(0).toUpperCase() + cleanColor.slice(1);

    if (typeof chalk[formattedColor] === 'function') {
        return chalk[formattedColor](text);
    }
    return text;
}

function bypassResetCode(text) {
    if (!text) return '';
    return text.replace(/\u001b\[0m/g, '').replace(/\x1b\[0m/g, '');
}

function formatAndCleanStack(error) {
    if (!error) return 'No error stack available';
    const stack = error.stack || String(error); 
    return stack
        .split('\n')
        .filter(line => !line.includes('node:internal') && !line.includes('(internal/') && !line.includes('node_modules')) 
        .join('\n'); 
}

module.exports = { safeChalk, bypassResetCode, formatAndCleanStack };
