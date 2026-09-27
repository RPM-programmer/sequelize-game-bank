interface BaseChalkMethods {
  reset(): ChalkInstance;
  bold(): ChalkInstance;
  dim(): ChalkInstance;
  italic(): ChalkInstance;
  underline(): ChalkInstance;
  inverse(): ChalkInstance;
  hidden(): ChalkInstance;
  strikethrough(): ChalkInstance;
  bgRed(): ChalkInstance;
  bgGreen(): ChalkInstance;
  bgYellow(): ChalkInstance;
  bgBlue(): ChalkInstance;
  Red(): ChalkInstance;
  Blue(): ChalkInstance;
  IndianRed(): ChalkInstance;
  LightCoral(): ChalkInstance;
  Salmon(): ChalkInstance;
  DarkSalmon(): ChalkInstance;
  LightSalmon(): ChalkInstance;
  Crimson(): ChalkInstance;
  FireBrick(): ChalkInstance;
  DarkRed(): ChalkInstance;
  Pink(): ChalkInstance;
  LightPink(): ChalkInstance;
  HotPink(): ChalkInstance;
  DeepPink(): ChalkInstance;
  MediumVioletRed(): ChalkInstance;
  PaleVioletRed(): ChalkInstance;
  Coral(): ChalkInstance;
  Tomato(): ChalkInstance;
  OrangeRed(): ChalkInstance;
  DarkOrange(): ChalkInstance;
  Orange(): ChalkInstance;
  Gold(): ChalkInstance;
  Yellow(): ChalkInstance;
  LightYellow(): ChalkInstance;
  LemonChiffon(): ChalkInstance;
  LightGoldenrodYellow(): ChalkInstance;
  PapayaWhip(): ChalkInstance;
  Moccasin(): ChalkInstance;
  PeachPuff(): ChalkInstance;
  PaleGoldenrod(): ChalkInstance;
  Khaki(): ChalkInstance;
  DarkKhaki(): ChalkInstance;
  GreenYellow(): ChalkInstance;
  Chartreuse(): ChalkInstance;
  LawnGreen(): ChalkInstance;
  Lime(): ChalkInstance;
  LimeGreen(): ChalkInstance;
  PaleGreen(): ChalkInstance;
  LightGreen(): ChalkInstance;
  MediumSpringGreen(): ChalkInstance;
  SpringGreen(): ChalkInstance;
  SeaGreen(): ChalkInstance;
  ForestGreen(): ChalkInstance;
  Green(): ChalkInstance;
  DarkGreen(): ChalkInstance;
  YellowGreen(): ChalkInstance;
  OliveDrab(): ChalkInstance;
  Olive(): ChalkInstance;
  DarkOliveGreen(): ChalkInstance;
  MediumAquamarine(): ChalkInstance;
  DarkSeaGreen(): ChalkInstance;
  LightSeaGreen(): ChalkInstance;
  DarkCyan(): ChalkInstance;
  Teal(): ChalkInstance;
  Aqua(): ChalkInstance;
  Cyan(): ChalkInstance;
  LightCyan(): ChalkInstance;
  PaleTurquoise(): ChalkInstance;
  Aquamarine(): ChalkInstance;
  Turquoise(): ChalkInstance;
  MediumTurquoise(): ChalkInstance;
  DarkTurquoise(): ChalkInstance;
  CadetBlue(): ChalkInstance;
  SteelBlue(): ChalkInstance;
  LightSteelBlue(): ChalkInstance;
  PowderBlue(): ChalkInstance;
  LightBlue(): ChalkInstance;
  SkyBlue(): ChalkInstance;
  LightSkyBlue(): ChalkInstance;
  DeepSkyBlue(): ChalkInstance;
  DodgerBlue(): ChalkInstance;
  CornflowerBlue(): ChalkInstance;
  RoyalBlue(): ChalkInstance;
  MediumBlue(): ChalkInstance;
  DarkBlue(): ChalkInstance;
  Navy(): ChalkInstance;
  MidnightBlue(): ChalkInstance;
  Lavender(): ChalkInstance;
  Thistle(): ChalkInstance;
  Plum(): ChalkInstance;
  Violet(): ChalkInstance;
  Orchid(): ChalkInstance;
  Fuchsia(): ChalkInstance;
  Magenta(): ChalkInstance;
  MediumOrchid(): ChalkInstance;
  MediumPurple(): ChalkInstance;
  Amethyst(): ChalkInstance;
  BlueViolet(): ChalkInstance;
  DarkViolet(): ChalkInstance;
  DarkOrchid(): ChalkInstance;
  DarkMagenta(): ChalkInstance;
  Purple(): ChalkInstance;
  Indigo(): ChalkInstance;
  SlateBlue(): ChalkInstance;
  DarkSlateBlue(): ChalkInstance;
  MediumSlateBlue(): ChalkInstance;
  Cornsilk(): ChalkInstance;
  BlanchedAlmond(): ChalkInstance;
  Bisque(): ChalkInstance;
  NavajoWhite(): ChalkInstance;
  Wheat(): ChalkInstance;
  BurlyWood(): ChalkInstance;
  Tan(): ChalkInstance;
  RosyBrown(): ChalkInstance;
  SandyBrown(): ChalkInstance;
  Goldenrod(): ChalkInstance;
  DarkGoldenrod(): ChalkInstance;
  Peru(): ChalkInstance;
  Chocolate(): ChalkInstance;
  SaddleBrown(): ChalkInstance;
  Sienna(): ChalkInstance;
  Brown(): ChalkInstance;
  Maroon(): ChalkInstance;
  White(): ChalkInstance;
  Snow(): ChalkInstance;
  Honeydew(): ChalkInstance;
  MintCream(): ChalkInstance;
  Azure(): ChalkInstance;
  AliceBlue(): ChalkInstance;
  GhostWhite(): ChalkInstance;
  WhiteSmoke(): ChalkInstance;
  Seashell(): ChalkInstance;
  Beige(): ChalkInstance;
  OldLace(): ChalkInstance;
  FloralWhite(): ChalkInstance;
  Ivory(): ChalkInstance;
  AntiqueWhite(): ChalkInstance;
  Linen(): ChalkInstance;
  LavenderBlush(): ChalkInstance;
  MistyRose(): ChalkInstance;
  Gainsboro(): ChalkInstance;
  LightGray(): ChalkInstance;
  Silver(): ChalkInstance;
  DarkGray(): ChalkInstance;
  Gray(): ChalkInstance;
  DimGray(): ChalkInstance;
  LightSlateGray(): ChalkInstance;
  SlateGray(): ChalkInstance;
  DarkSlateGray(): ChalkInstance;
  Black(): ChalkInstance;
  bgTomato(): ChalkInstance;
  bgOrange(): ChalkInstance;
  bgGold(): ChalkInstance;
  bgYellow(): ChalkInstance;
  bgLime(): ChalkInstance;
  bgGreen(): ChalkInstance;
  bgCyan(): ChalkInstance;
  bgTeal(): ChalkInstance;
  bgMidnightBlue(): ChalkInstance;
  bgMagenta(): ChalkInstance;
  bgPurple(): ChalkInstance;
  bgWhite(): ChalkInstance;
  bgBlack(): ChalkInstance;

  /** Use your custom RGB color / Использовать свой RGB цвет */
  custom(): ChalkInstance;
}

declare class AnimationInstance {
  /** Rainbow scrolling text / Бегущая радужная строка */
  rainbow(text: string, speed?: number): { stop(): void };
  /** Typewriter simulation / Имитация печатной машинки */
  typewriter(text: string, speed?: number): Promise<void>;
  /** Matrix digital rain / Цифровой дождь Матрицы */
  matrix(duration?: number): Promise<void>;
  /** Terminal text glitch / Хакерское искажение текста */
  glitch(text: string, duration?: number): Promise<void>;
  /** Smooth text fading / Синусоидальная пульсация текста */
  pulse(text: string, duration?: number): Promise<void>;
  /** Full-screen procedurial fire / Полноэкранный процедурный огонь */
  fire(duration?: number): Promise<void>;
  /** Matrix rain with custom color / Дождь Матрицы с выбором цвета */
  matrix(duration?: number, colorName?: 'green' | 'orange' | 'blue' | 'yellow' | 'red'): Promise<void>;
  /** Mask password inputs / Скрывать ввод пароля за звездочками */
  passwordMask(question?: string, maskChar?: string): Promise<string>;
  /** Dynamic visual progress bar / Цветной индикатор выполнения */
  progressBar(totalSteps?: number): { update(currentStep: number): void };
  /** TrueColor smooth gradient / Плавный 24-битный градиент */
  gradient(text: string, colorFrom: string, colorTo: string): string;
  /** Animated loading indicator / Анимированная крутилка загрузки */
  spinner(text?: string, style?: 'dots' | 'line' | 'arrows'): { stop(finalStatus?: string): void };
}

type InvertCase<T extends string> = T extends `${infer F}${infer R}`
  ? F extends Capitalize<F> ? `${Uncapitalize<F>}${R}` : `${Capitalize<F>}${R}` : T;

type InvertedMethods = { [K in keyof BaseChalkMethods as InvertCase<Extract<K, string>>]: BaseChalkMethods[K]; };

interface ChalkCallable {
  (text?: string): ChalkInstance | string;
  /** Set your custom RGB values / Задать свои значения RGB */
  setCustomColor(red: number, green: number, blue: number): void;
}

// Убираем слово export отсюда, оставляем просто определение типа
type ChalkInstance = ChalkCallable & BaseChalkMethods & InvertedMethods & {
  customise(str: string): string;
  animation: AnimationInstance;
};
declare const myChalk: ChalkInstance;
export = myChalk;