const codes = require("./rgb-codes.js");
const AnimationClass = require("./animation.js"); // Проверьте эту строку!

const RGB_COLORS = codes.rgb;
const ANSI_STYLES = codes.ansi;
let customColor =[0,0,0];

// Создаем инстанс ОДИН раз здесь:
const animationInstance = new AnimationClass(); 


function createChalk(activeCodes = []) {
  const builder = function(text) {
    if (text === undefined) return createChalk(activeCodes);
    return activeCodes.join("") + text + ANSI_STYLES.reset;
  };
  
  builder.setCustomColor = function(red, green, blue) {
    if ([red, green, blue].some(c => typeof c !== "number" || c < 0 || c > 255)) {
      throw new Error("Color components must be between 0 and 255.");
    }
    customColor = [red, green, blue];
  };

  return new Proxy(builder, {
        get(target, prop) {
      if (typeof prop !== "string") return target[prop];
      if (prop === "animation") {
        return animationInstance;
      }
      let nextCode = "";
      if (prop in ANSI_STYLES) {
        nextCode = ANSI_STYLES[prop];
      } 
      else if (prop.startsWith("bg") && prop.slice(2) in RGB_COLORS) {
        const [r, g, b] = RGB_COLORS[prop.slice(2)];
        nextCode = "\u001b[48;2;" + r + ";" + g + ";" + b + "m";
      } 
      else if (prop in RGB_COLORS) {
        const [r, g, b] = RGB_COLORS[prop];
        nextCode = "\u001b[38;2;" + r + ";" + g + ";" + b + "m";
      } 
      else if (prop === "custom") {
        const [r, g, b] = customColor;
        nextCode = "\u001b[38;2;" + r + ";" + g + ";" + b + "m";
      }
      else {
        return target[prop];
      }
      return function(text) {
        const updatedCodes = [...activeCodes, nextCode];
        if (text === undefined) {
          return createChalk(updatedCodes);
        }
        return updatedCodes.join("") + text + ANSI_STYLES.reset;
      };
    }
  });
}

const chalkInstance = createChalk();

chalkInstance.customise = function(str) {
  const words = str.trim().split(/\s+/);
  const urlRegex = /^(https?:\/\/|www\.)|^[a-z0-9а-яё\-]+\.[a-zа-яё]{2,24}/i;
  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    const cleanWord = word.replace(/[.,\/#!\(\%\^&\*;:{}=\-_`~()]+\)/, '');
    if (urlRegex.test(cleanWord)) {
      let fullUrl = cleanWord;
      if (!/^https?:\/\//i.test(cleanWord)) {
        fullUrl = 'https://' + cleanWord;
      }
      const punctuation = word.slice(cleanWord.length); 
      words[i] = `\x1b]8;;${fullUrl}\x1b\\${cleanWord}\x1b]8;;\x1b\\${punctuation}`;
    }
  }
  console.log(words.join(' '));
  return words.join(" ");
};

module.exports = chalkInstance;
