# chalk-palette

<p align="left">
  <b>English</b> | <a href="./README.ru.md">Русский</a>
</p>

---
> **chalk-palette** is an ultra-lightweight Node.js library that transforms dull, monochrome terminal text into a vibrant, interactive interface. It supports over 140 colors, gradients, and full-fledged visual effects (VFX) like "Matrix" or "Fire."


---

## 🛠️ Installation

Simply install the package via your package manager:

```bash
npm install chalk-palette
```

---

## 📖 API Reference

The library is divided into two parts: basic methods (available directly via `chalk`) and animated methods (available via `chalk.animation`).

---

### 🎨 1. Basic Styling Methods

#### `chalk.[ColorName](text)` / `chalk.[style].[ColorName](text)`
* **What it does:** Colors text or applies styles to it within a single line.
* **Arguments:** `text` (String) — the text to be colored.
* **Palette:** Over 140 colors available (case-insensitive; e.g., `Red`, `red`, `Tomato`, `tomato`).
* **Example:** `chalk.bold.italic.Tomato("Hello")`

#### `chalk.setCustomColor(r, g, b)`
* **What it does:** Saves a custom color to the library's memory.
* **Arguments:** `r`, `g`, `b` (Numbers) — values ​​from 0 to 255.
* **Returns:** Nothing. The result is output using the next method.
* **Example:**
```javascript
chalk.setCustomColor(255, 128, 0); // Saved orange
console.log(chalk.custom("This text will be orange"));
```

#### `chalk.customise(text)`
* **What it does:** Finds links in the text and turns them into clickable terminal hyperlinks. Punctuation marks surrounding the links remain intact.
* **Arguments:** `text` (String) — the string containing text and links.
* **What it returns:** A formatted string (String) and automatically outputs it via `console.log`.

---

### 🎬 2. Animations and UI elements (`chalk.animation.*`)

> 💡 **Important:** Most animations return a `Promise`. Use `await` to ensure effects play sequentially.

#### `.gradient(text, colorFrom, colorTo)`
* **What it does:** Colors the text with a smooth TrueColor gradient. Each character gets its own shade.
* **Arguments:**
* `text` (String) — the source text. 
* `colorFrom`, `colorTo` (String) — names of the start and end colors from the palette (e.g., `'Red'`, `'Blue'`).
* **What it returns:** A string (String) containing ANSI codes. Does **not** return a Promise; output via `console.log`.

#### `.typewriter(text, speed)`
* **What it does:** Prints text to the screen character by character, simulating manual typing.
* **Arguments:**
* `text` (String) — the text to output. 
* `speed` (Number) — delay in milliseconds between characters (default: `50`).
* **What it returns:** `Promise<void>`.

#### `.rainbow(text, speed)`
* **What it does:** Starts an infinite loop where the text cycles through all the colors of the rainbow in place.
* **Arguments:**
* `text` (String) — the text. 
* `speed` (Number) — the color-changing speed in ms (default: `50`).
* **Returns:** An object with a control method: `{ stop: () => void }`.
* **Example:**
```javascript
const fx = chalk.animation.rainbow("Text"); 
setTimeout(() => fx.stop(), 3000); // Stops the rainbow after 3 seconds
```

#### `.spinner(text, style)`
* **Function:** Creates an animated spinner (loading indicator) at the beginning of the line.
* **Arguments:**
* `text` (String) — the text next to the spinner. 
* `style` (String) — the animation style (`'dots'`, `'line'`, `'arrows'`).
* **Returns:** A control object: `{ stop: (finalStatus) => void }`. The `.stop()` method stops the animation, removes the spinner, displays a green checkmark, and outputs the final status.

#### `.progressBar(totalSteps)`
* **Function:** Renders a progress bar that automatically changes color from red (at the start) to green (at the end).
* **Arguments:** `totalSteps` (Number) — the maximum number of steps (e.g., `100`).
* **Returns:** A control object: `{ update: (currentStep) => void }`. The `.update()` method accepts the current step and redraws the bar.

#### `.passwordMask(question, maskChar)`
* **Function:** Masks user keyboard input with asterisks (or any other character).
* **Arguments:**
* `question` (String) — the prompt text (e.g., `"Enter password: "`). * `maskChar` (String) — the mask character (default: `*`).
* **Returns:** `Promise<string>` — returns the raw string entered by the user.

---

### 🖥️ 3. Full-screen visual effects (VFX)

> ⚠️ **Screen behavior:** All functions below automatically render the animation on an alternate terminal screen. Upon completion, they clear the animation and restore your console to its original state without cluttering the log history.

#### `.textAssemble(text, duration)`
* **What it does:** Scatters letters across the screen, then smoothly draws them toward the center to assemble the final word.
* **Arguments:** `text` (String), `duration` (Number, in ms; default: `4500`).
* **Returns:** `Promise<void>`.

#### `.textLaser(text, duration)`
* **What it does:** Draws a moving laser beam that behind scorched, colored text characters.
* **Arguments:** `text` (String), `duration` (Number, in ms, default `2500`).
* **Returns:** `Promise<void>`.

#### `.textShimmer(text, duration)`
* **Action:** Displays the text with a bright light wave (glint) sweeping across it from left to right.
* **Arguments:** `text` (String), `duration` (Number, in ms, default `2000`).
* **Returns:** `Promise<void>`.

#### `.textMorph(textFrom, textTo, duration)`
* **Action:** Takes the first word, performs a chaotic dance of its characters, and smoothly transforms it into the second word.
* **Arguments:** `textFrom` (String), `textTo` (String), `duration` (Number, in ms, default `3800`).
* **Returns:** `Promise<void>`.

#### `.matrix(duration, colorName)`
* **Action:** A full-screen "digital rain" effect featuring characters in the style of *The Matrix* movie.
* **Arguments:**
* `duration` (Number, in ms, default `5000`). 
* `colorName` (String) — the color of the rain (`'green'`, `'orange'`, `'blue'`, `'yellow'`, `'red'`).
* **Returns:** `Promise<void>`.

#### `.fire(duration)`
* **Action:** A full-screen procedural generator of raging flames based on heat distribution physics.
* **Arguments:** `duration` (Number, in ms, default `5000`).
* **Returns:** `Promise<void>`. #### `.glitch(text, duration)`
* **What it does:** Centers the text, makes it shake violently horizontally, and replaces some characters with hacker-style glyphs.
* **Arguments:** `text` (String), `duration` (Number, in ms, default `3000`).
* **Returns:** `Promise<void>`.

#### `.pulse(text, duration)`
* **What it does:** Centers the text on the screen and makes it smoothly fade in and out following a sinusoidal pattern.
* **Arguments:** `text` (String), `duration` (Number, in ms, default `4000`).
* **Returns:** `Promise<void>`.

#### `.textExplode(text, config)`
* **What it does:** Types out the text, highlights the central character (the "C4 charge"), pulses, and then explodes the string, creating a circular shockwave and scattering ash.
* **Arguments:**
* `text` (String) — the text. 
* `config` (Object) — explosion parameters: `{ type: 'c4'|'nuke'|'torpedo', duration: 3000, c4Color: 'red' }`.
* **Returns:** `Promise<void>`.

## 📄 License

This project is distributed under the **MIT** license. You are free to use it for any personal or commercial purpose.

---

## 👤 Author

* **prm-programmer** — [GitHub](https://github.com/RPM-programmer)
* **Code** — [GitHub](https://github.com/RPM-programmer/chalk-palette) [Npm]()