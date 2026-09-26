> # chalk-palette 🎨

[<img src="https://img.icons8.ru/?size=100&id=24895&format=png&color=000000" height="60" align="center"> npm versions](https://www.npmjs.com/package/chalk-palette?activeTab=versions)
[<img src="https://img.icons8.ru/?size=100&id=24895&format=png&color=000000" height="60" align="center"> На npm](https://www.npmjs.com/package/chalk-palette)
[<img src="https://img.icons8.ru/?size=100&id=12599&format=png&color=000000" height="60" align="center"> На GitHub](https://github.com/RPM-programmer/chalk-palette)
[<img src="https://img.icons8.ru/?size=100&id=dvsOEzqniDma&format=png&color=000000" height="60" align="center"> License](LICENSE)

[English](#english-documentation) | [Русское описание](#русская-документация)

---

## 🎭 Live Showcase / Демонстрация работы
![Chalk Palette Showcase](./assets/demo.gif)

---

## English Documentation

A secure, lightweight, and supercharged alternative to `chalk` with **140+ built-in colors**, TypeScript autocomplete support, and a powerful **cross-platform animation engine**.

Works flawlessly across **Linux**, **macOS**, and **Windows** (including legacy CMD).

### 📦 Installation

```bash
npm install chalk-palette
# or
yarn add chalk-palette
```

### 💻 Quick Start

<details>
<summary><b>CommonJS (Node.js / require)</b></summary>

```javascript
const chalk = require('chalk-palette');

// 1. Standard Colors (PascalCase)
console.log(chalk.Red("This is red text"));
console.log(chalk.DeepSkyBlue("Beautiful sky blue text"));

// 2. Backgrounds
console.log(chalk.bgTomato("Tomato background text"));

// 3. System Styles (lowercase)
console.log(chalk.bold("Bold text"));
console.log(chalk.underline("Underlined text"));

// 4. Clickable Links (Auto-detection)
chalk.customise("Visit our repository at https://github.com");
```
</details>

<details>
<summary><b>ES Modules / TypeScript (import)</b></summary>

```typescript
import chalk from 'chalk-palette';

// 1. Standard Colors (PascalCase)
console.log(chalk.Red("This is red text"));
console.log(chalk.DeepSkyBlue("Beautiful sky blue text"));

// 2. Backgrounds
console.log(chalk.bgTomato("Tomato background text"));

// 3. System Styles (lowercase)
console.log(chalk.bold("Bold text"));
console.log(chalk.underline("Underlined text"));

// 4. Clickable Links (Auto-detection)
chalk.customise("Visit our repository at https://github.com");
```
</details>

### 🎭 Animation & CLI Tools (`chalk.animation`)

#### 1. Live Text Effects
* **`rainbow(text, speed)`** — Smooth color-shifting wave across the text string. Supports emojis without breaking characters!
  ```javascript
  const rainbow = chalk.animation.rainbow("Live moving rainbow wave! 🌈", 50);
  setTimeout(() => rainbow.stop(), 5000); // Stop after 5 seconds
  ```
* **`typewriter(text, speed)`** — Prints text character by character with an adjustable typing delay.
  ```javascript
  await chalk.animation.typewriter("Initializing secured terminal interface...", 40);
  ```
* **`gradient(text, colorFrom, colorTo)`** — Generates a static, non-animated smooth color blend between any two palette colors. Great for app banners.
  ```javascript
  const banner = chalk.animation.gradient("=== MY SUPER CLI ===", "DeepSkyBlue", "DeepPink");
  console.log(banner);
  ```

#### 2. Full-Screen Visuals (Alternate Buffer Safe)
*These effects temporary switch the terminal screen, run the animation, and restore your logs perfectly upon exit.*
* **`matrix(duration, colorName)`** — The iconic falling character effect. Supports 5 color modes: `'green'`, `'blue'`, `'yellow'`, `'red'`, and a textured `'orange'` fire mode.
  ```javascript
  await chalk.animation.matrix(3000, 'blue'); // Runs blue matrix rain for 3 seconds
  ```
* **`fire(duration)`** — A procedural, fully animated fire simulator rendering live flames right in your CLI.
  ```javascript
  await chalk.animation.fire(4500);
  ```
* **`glitch(text, duration)`** — Cyberpunk terminal error screen with shaky, shifting characters.
* **`pulse(text, duration)`** — Cinematic fading and glowing breathing text inside pitch darkness.

#### 3. Smart UI Tools
* **`progressBar(totalSteps)`** — Draws a beautifully filling progress bar that automatically scales to the width of the user's terminal window and transitions from hot-red to bright-green.
  ```javascript
  const bar = chalk.animation.progressBar(100);
  for (let i = 0; i <= 100; i++) {
      bar.update(i);
      await new Promise(r => setTimeout(r, 20));
  }
  ```
* **`passwordMask(question, maskChar)`** — Puts terminal into raw-mode to capture keyboard inputs safely. Masks letters into custom bullets while perfectly processing `Backspace`, `Enter`, and emergency abort via `Ctrl+C`.
  ```javascript
  const token = await chalk.animation.passwordMask("Enter your API Token: ", "•");
  ```

---

## Русская Документация

Безопасная, легкая и расширенная альтернатива пакету `chalk` с **более чем 140 встроенными цветами**, поддержкой автодополнения в TypeScript/IDE и мощным **кроссплатформенным движком анимации**.

Идеально работает на **Linux**, **macOS** и **Windows** (включая классический CMD).

### 📦 Установка

```bash
npm install chalk-palette
# or
yarn add chalk-palette
```

### 💻 Быстрый старт

<details>
<summary><b>CommonJS (Node.js / require)</b></summary>

```javascript
const chalk = require('chalk-palette');

// 1. Стандартные цвета (PascalCase)
console.log(chalk.Red("Это красный текст"));
console.log(chalk.DeepSkyBlue("Красивый небесно-синий текст"));

// 2. Фон для текста
console.log(chalk.bgTomato("Текст с томатным фоном"));

// 3. Системные стили (строчные буквы)
console.log(chalk.bold("Жирный текст"));
console.log(chalk.underline("Подчеркнутый текст"));

// 4. Кликабельные ссылки (Автоматическое определение)
chalk.customise("Посетите наш репозиторий: https://github.com");
```
</details>

<details>
<summary><b>ES Modules / TypeScript (import)</b></summary>

```typescript
import chalk from 'chalk-palette';

// 1. Стандартные цвета (PascalCase)
console.log(chalk.Red("Это красный текст"));
console.log(chalk.DeepSkyBlue("Красивый небесно-синий текст"));

// 2. Фон для текста
console.log(chalk.bgTomato("Текст с томатным фоном"));

// 3. Системные стили (строчные буквы)
console.log(chalk.bold("Жирный текст"));
console.log(chalk.underline("Подчеркнутый текст"));

// 4. Кликабельные ссылки (Автоматическое определение)
chalk.customise("Посетите наш репозиторий: https://github.com");
```
</details>



### 🎭 Анимации и CLI-инструменты (`chalk.animation`)

#### 1. Живые текстовые эффекты
* **`rainbow(text, speed)`** — Плавная бегущая радужная волна по строке. Корректно обрабатывает эмодзи и не ломает символы!
  ```javascript
  const rainbow = chalk.animation.rainbow("Живая бегущая радуга! 🌈", 50);
  setTimeout(() => rainbow.stop(), 5000); // Остановить через 5 секунд
  ```
* **`typewriter(text, speed)`** — Эффект печатной машинки, выводящий текст посимвольно с настраиваемой задержкой.
  ```javascript
  await chalk.animation.typewriter("Инициализация защищенного интерфейса...", 40);
  ```
* **`gradient(text, colorFrom, colorTo)`** — Генерирует статичное, не анимированное плавное переливание между любыми двумя цветами палитры. Отлично подходит для стартовых баннеров приложений.
  ```javascript
  const banner = chalk.animation.gradient("=== МОЙ СКРИПТ ===", "DeepSkyBlue", "DeepPink");
  console.log(banner);
  ```

#### 2. Полноэкранные визуальные эффекты (Безопасны для логов)
*Эти эффекты временно переключают экран терминала (альтернативный буфер), запускают анимацию и полностью восстанавливают ваши старые логи при выходе.*
* **`matrix(duration, colorName)`** — Культовый цифровой дождь. Поддерживает 5 цветов: `'green'`, `'blue'`, `'yellow'`, `'red'`, а также текстурный оранжевый режим огня `'orange'`.
  ```javascript
  await chalk.animation.matrix(3000, 'blue'); // Синяя матрица на 3 секунды
  ```
* **`fire(duration)`** — Процедурный симулятор пламени, генерирующий живой ASCII-огонь прямо в консоли.
  ```javascript
  await chalk.animation.fire(4500);
  ```
* **`glitch(text, duration)`** — Эффект цифрового сбоя (киберпанк) с дрожащими и хаотично меняющимися символами.
* **`pulse(text, duration)`** — Плавное появление и затухание («дыхание») текста в полной темноте.

#### 3. Умные UI-инструменты
* **`progressBar(totalSteps)`** — Прогресс-бар, который автоматически масштабируется под физическую ширину окна терминала и плавно меняет цвет от тревожного красного к салатово-зеленому.
  ```javascript
  const bar = chalk.animation.progressBar(100);
  for (let i = 0; i <= 100; i++) {
      bar.update(i);
      await new Promise(r => setTimeout(r, 20));
  }
  ```
* **`passwordMask(question, maskChar)`** — Переводит терминал в raw-режим для безопасного перехвата ввода. Превращает буквы в кастомные маркеры (например, точки), корректно обрабатывая `Backspace`, `Enter` и экстренный выход по `Ctrl+C`.
  ```javascript
  const token = await chalk.animation.passwordMask("Введите ваш API токен: ", "•");
  ```

---

## 🛠 Advanced / Кастомизация

You can dynamically set a temporary RGB state using `setCustomColor` / Вы можете динамически задать кастомный RGB-цвет:

```javascript
chalk.setCustomColor(142, 68, 173);
console.log(chalk.custom("Custom colored text"));
```

---

## 📜 License / Лицензия

MIT © [prm-programmer](https://github.com)
