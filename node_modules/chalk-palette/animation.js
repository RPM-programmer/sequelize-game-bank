const codes = require("./rgb-codes.js");
const RGB_COLORS = codes.rgb;
const execSync = require("child_process").execSync;

if (process.platform === "win32") {
    try {
        execSync("chcp 65001", { stdio: "ignore" });
    } catch (e) {}
}

class animation {
    constructor() {
        this.reset = codes.ansi ? codes.ansi.reset : "\u001b[0m";
        this.cleanLine = "\u001b[G\u001b[K"; 
        this.hideCursor = "\u001b[?25l";
        this.showCursor = "\u001b[?25h";
        this.supportsTrueColor = 
            process.env.COLORTERM === "truecolor" || 
            process.env.COLORTERM === "24bit" ||
            (process.platform === "win32" && process.env.WT_SESSION) || 
            process.platform === "darwin";
        this.lowerCaseColors = {};
        for (const key in RGB_COLORS) {
            this.lowerCaseColors[key.toLowerCase()] = RGB_COLORS[key];
        }

    }
    rgbToAnsi256(r, g, b) {
        if (r === g && g === b) {
            if (r < 8) return 16;
            if (r > 248) return 231;
            return Math.round(((r - 8) / 247) * 24) + 232;
        }
        return 16 + 36 * Math.floor(r / 255 * 5) + 6 * Math.floor(g / 255 * 5) + Math.floor(b / 255 * 5);
    }
    rainbow(text, speed = 50) {
        if (!text || typeof text !== "string") return { stop: () => {} };
        let phase = 0;
        const chars = Array.from(text);
        const textLength = chars.length > 0 ? chars.length : 1;
        process.stdout.write(this.hideCursor);
        const intervalId = setInterval(() => {
            let result = "";
            for (let i = 0; i < chars.length; i++) {
                const char = chars[i];
                if (char === " ") { result += " "; continue; }
                const frequency = (i / textLength) * 2 * Math.PI + phase;
                const r = Math.floor(Math.sin(frequency) * 127 + 128);
                const g = Math.floor(Math.sin(frequency + 2.09439) * 127 + 128);
                const b = Math.floor(Math.sin(frequency + 4.18879) * 127 + 128);
                let colorCode = this.supportsTrueColor 
                    ? "\u001b[38;2;" + r + ";" + g + ";" + b + "m"
                    : "\u001b[38;5;" + this.rgbToAnsi256(r, g, b) + "m";
                result += colorCode + char;
            }
            process.stdout.write(this.cleanLine + result + this.reset);
            phase -= 0.12; 
        }, speed);
        return {
            stop: () => {
                clearInterval(intervalId);
                process.stdout.write(this.showCursor + "\n");
            }
        };
    }
    typewriter(text, speed = 50) {
        if (!text || typeof text !== "string") return Promise.resolve();
        const chars = Array.from(text);
        let i = 0;
        return new Promise((resolve) => {
            process.stdout.write(this.hideCursor);
            const intervalId = setInterval(() => {
                if (i < chars.length) {
                    process.stdout.write(chars[i]);
                    i++;
                } else {
                    clearInterval(intervalId);
                    process.stdout.write(this.showCursor + "\n");
                    resolve();
                }
            }, speed);
        });
    }
    glitch(text, duration = 3000) {
        if (!text || typeof text !== "string") return Promise.resolve();
        const chars = Array.from(text);
        const glitchSymbols = "!@#$%^&*()_+-=[]{}|;':\",./<>?X█▓▒░";
        process.stdout.write("\u001b[?1049h\u001b[2J" + this.hideCursor);
        const rows = process.stdout.rows || 24;
        const columns = process.stdout.columns || 80;
        const centerY = Math.floor(rows / 2);
        const centerX = Math.max(1, Math.floor((columns - chars.length) / 2));
        return new Promise((resolve) => {
            const intervalId = setInterval(() => {
                let currentLine = "";
                for (let i = 0; i < chars.length; i++) {
                    let char = chars[i];
                    let color = "\u001b[37m";
                    if (Math.random() < 0.15 && char !== " ") {
                        char = glitchSymbols[Math.floor(Math.random() * glitchSymbols.length)];
                        const r = Math.random() > 0.5 ? 255 : 0;
                        const g = Math.random() > 0.5 ? 255 : 0;
                        const b = Math.random() > 0.5 ? 255 : 0;
                        color = "\u001b[38;2;" + r + ";" + g + ";" + b + "m";
                    }
                    currentLine += color + char;
                }
                const shakeX = centerX + (Math.random() < 0.2 ? Math.floor(Math.random() * 3) - 1 : 0);
                const pos = "\u001b[" + centerY + ";" + shakeX + "H";
                process.stdout.write("\u001b[2J" + pos + currentLine + this.reset);
            }, 60);
            setTimeout(() => {
                clearInterval(intervalId);
                process.stdout.write("\u001b[?1049l" + this.showCursor + this.reset);
                resolve();
            }, duration);
        });
    }
    pulse(text, duration = 4000) {
        if (!text || typeof text !== "string") return Promise.resolve();
        
        process.stdout.write("\u001b[?1049h\u001b[2J" + this.hideCursor);
        
        const rows = process.stdout.rows || 24;
        const columns = process.stdout.columns || 80;
        const centerY = Math.floor(rows / 2);
        const centerX = Math.max(1, Math.floor((columns - text.length) / 2));
        const pos = "\u001b[" + centerY + ";" + centerX + "H";

        let alpha = 0; // Фаза пульсации

        return new Promise((resolve) => {
            const intervalId = setInterval(() => {
                // Высчитываем яркость по синусоиде от 0 до 255
                const brightness = Math.floor((Math.sin(alpha) + 1) * 127.5);
                
                // Изменяем яркость для всех трех каналов (получаем оттенки серого/белого)
                const colorCode = "\u001b[38;2;" + brightness + ";" + brightness + ";" + brightness + "m";
                
                process.stdout.write("\u001b[2J" + pos + colorCode + text + this.reset);
                alpha += 0.08;
            }, 30);

            setTimeout(() => {
                clearInterval(intervalId);
                process.stdout.write("\u001b[?1049l" + this.showCursor + this.reset);
                resolve();
            }, duration);
        });
    }
    fire(duration = 5000) {
        process.stdout.write("\u001b[?1049h\u001b[2J" + this.hideCursor);
        const w = process.stdout.columns || 80;
        const h = process.stdout.rows || 24;
        let fireBuffer = Array(w * h).fill(0);
        const fireChars = " .:-=+*#%@";
        return new Promise((resolve) => {
            const intervalId = setInterval(() => {
                for (let x = 0; x < w; x++) {
                    fireBuffer[(h - 1) * w + x] = Math.random() > 0.4 ? 9 : 0;
                }
                let frame = "\u001b[H";
                for (let y = 0; y < h - 1; y++) {
                    for (let x = 0; x < w; x++) {
                        const srcIndex = (y + 1) * w + ((x + Math.floor(Math.random() * 3) - 1 + w) % w);
                        const currentVal = fireBuffer[srcIndex];
                        const newVal = currentVal > 0 ? currentVal - (Math.random() > 0.6 ? 1 : 0) : 0;
                        fireBuffer[y * w + x] = newVal;
                        const char = fireChars[newVal];
                        let color = "\u001b[30m";
                        if (newVal > 7) color = "\u001b[1;37m";
                        else if (newVal > 5) color = "\u001b[33m";
                        else if (newVal > 2) color = "\u001b[31m";
                        else if (newVal > 0) color = "\u001b[2;31m";
                        frame += color + char;
                    }
                }
                process.stdout.write(frame);
            }, 50);
            setTimeout(() => {
                clearInterval(intervalId);
                process.stdout.write("\u001b[?1049l" + this.showCursor + this.reset);
                resolve();
            }, duration);
        });
    }
    matrix(duration = 5000, colorName = "green") {
        const columns = process.stdout.columns || 80;
        const rows = process.stdout.rows || 24;
        const drops = Array(columns).fill(0).map(() => Math.floor(Math.random() * -rows));
        const matrixChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
        const fireChars = " .:-=+*#%@"; 
        process.stdout.write("\u001b[?1049h\u001b[2J" + this.hideCursor);
        return new Promise((resolve) => {
            const intervalId = setInterval(() => {
                let frame = "";
                for (let x = 0; x < columns; x++) {
                    const y = drops[x];
                    if (y >= 0 && y < rows) {
                        const charList = (colorName.toLowerCase() === "orange") ? fireChars : matrixChars;
                        const char = charList[Math.floor(Math.random() * charList.length)];
                        const pos = "\u001b[" + (y + 1) + ";" + (x + 1) + "H";
                        let color = "";
                        const isHead = Math.random() > 0.92;
                        if (isHead) {
                            color = "\u001b[1;37m";
                        } else {
                            switch (colorName.toLowerCase()) {
                                case "orange":
                                    color = (Math.random() > 0.5) ? "\u001b[33m" : "\u001b[31m"; 
                                    break;
                                case "blue":
                                    color = "\u001b[34m";
                                    break;
                                case "yellow":
                                    color = "\u001b[33m";
                                    break;
                                case "red":
                                    color = "\u001b[31m";
                                    break;
                                case "green":
                                default:
                                    color = "\u001b[32m";
                                    break;
                            }
                        }
                        frame += pos + color + char;
                    }
                    drops[x]++;
                    if (drops[x] >= rows) {
                        drops[x] = Math.random() > 0.95 ? 0 : Math.floor(Math.random() * -5);
                    }
                }
                process.stdout.write(frame);
            }, 40);
            setTimeout(() => {
                clearInterval(intervalId);
                // Возвращаем старый экран на место
                process.stdout.write("\u001b[?1049l" + this.showCursor + this.reset);
                resolve();
            }, duration);
        });
    }
    passwordMask(question = "Password: ", maskChar = "*") {
        return new Promise((resolve, reject) => {
            process.stdout.write(question + this.showCursor);
            const stdin = process.stdin;
            stdin.setRawMode(true);
            stdin.resume();
            stdin.setEncoding("utf8");
            let password = "";
            const cleanup = () => {
                try {
                    stdin.setRawMode(false);
                    stdin.pause();
                    stdin.removeListener("data", handleKey);
                    process.removeListener("uncaughtException", handleCrash);
                } catch (e) {}
            };
            const handleCrash = (err) => {
                cleanup();
                process.stdout.write("\n");
                console.error(err);
                process.exit(1);
            };
            process.once("uncaughtException", handleCrash);
            function handleKey(key) {
                const buffer = Buffer.from(key);
                if (buffer.length === 1 && buffer[0] === 3) {
                    cleanup();
                    process.stdout.write("\n");
                    process.exit(0); 
                }
                if (buffer.length === 1 && (buffer[0] === 13 || buffer[0] === 10)) {
                    cleanup();
                    process.stdout.write("\n");
                    resolve(password);
                    return;
                }
                if (buffer.length === 1 && (buffer[0] === 127 || buffer[0] === 8)) {
                    if (password.length > 0) {
                        password = password.slice(0, -1);
                        process.stdout.write("\b\x1b[K");
                    }
                    return;
                }
                if (buffer[0] === 27) return;
                password += key;
                process.stdout.write(maskChar);
            }
            stdin.on("data", handleKey);
        });
    }
    progressBar(totalSteps = 100) {
        const reset = this.reset;
        process.stdout.write(this.hideCursor);
        return {
            update: (currentStep) => {
                if (currentStep > totalSteps) currentStep = totalSteps;
                if (currentStep < 0) currentStep = 0;
                const percentage = Math.floor((currentStep / totalSteps) * 100);
                const terminalWidth = process.stdout.columns || 80;
                const barWidth = Math.max(15, Math.floor(terminalWidth * 0.35)); 
                const filledWidth = Math.round((currentStep / totalSteps) * barWidth);
                const emptyWidth = barWidth - filledWidth;
                const filledBar = "█".repeat(filledWidth);
                const emptyBar = "░".repeat(emptyWidth);
                const factor = currentStep / totalSteps;
                const r = Math.floor((1 - factor) * 200 + 55);
                const g = Math.floor(factor * 200 + 55);
                const colorCode = "\u001b[38;2;" + r + ";" + g + ";55m";
                const output = "\r\u001b[KProgress: [" + colorCode + filledBar + reset + emptyBar + "] " + 
                               percentage + "% (" + currentStep + "/" + totalSteps + ")";
                process.stdout.write(output);
                if (currentStep === totalSteps) {
                    process.stdout.write("\n\u001b[?25h");
                }
            }
        };
    }
    gradient(text, colorFrom, colorTo) {
        if (!text || typeof text !== "string") return "";
        const startColor = this.lowerCaseColors[colorFrom.toLowerCase()];
        const endColor = this.lowerCaseColors[colorTo.toLowerCase()];

        const chars = Array.from(text);
        const len = chars.length > 1 ? chars.length - 1 : 1;
        let result = "";
        for (let i = 0; i < chars.length; i++) {
            const factor = i / len;
            const r = Math.floor(startColor[0] + (endColor[0] - startColor[0]) * factor);
            const g = Math.floor(startColor[1] + (endColor[1] - startColor[1]) * factor);
            const b = Math.floor(startColor[2] + (endColor[2] - startColor[2]) * factor);
            const colorCode = "\u001b[38;2;" + r + ";" + g + ";" + b + "m";
            result += colorCode + chars[i];
        }
        return result + this.reset;
    }
    spinner(text = "Loading...", style = "dots") {
        process.stdout.write(this.hideCursor);
        const themes = {
            dots: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
            line: ["-", "\\", "|", "/"],
            arrows: ["←", "↖", "↑", "↗", "→", "↘", "↓", "↙"]
        };
        const frames = themes[style] || themes.dots;
        let currentFrame = 0;
        const intervalId = setInterval(() => {
            const frame = frames[currentFrame];
            const coloredFrame = "\u001b[36m" + frame + this.reset;
            process.stdout.write("\r\u001b[K" + coloredFrame + " " + text);
            currentFrame = (currentFrame + 1) % frames.length;
        }, 80);
        return {
            stop: (finalStatus = "Success!") => {
                clearInterval(intervalId);
                process.stdout.write("\r\u001b[K\u001b[32m✓\u001b[0m " + text + " — " + finalStatus + "\n");
                process.stdout.write(this.showCursor);
            }
        };
    }
}

module.exports = animation;
