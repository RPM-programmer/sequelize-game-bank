// 1. Базовые методы, которые есть у каждого компонента
export interface ComponentMethods {
  Info(...info: any[]): string;
  Error(...error: any[]): string;
  Warn(...warn: any[]): string;
  FunctionInfo(funName: string, ...info: any[]): string;
  FunctionStatus(function_name: string, ...return_info: any[]): string;
  FunctionPrint(funName: string, ...text: any[]): string;
  FunctionPositivePerformance(funName: string, ...text: any[]): string;
  FunctionNegativePerformance(funName: string, ...text: any[]): string;
}

// 2. Список стандартных компонентов
type DefaultComponents = 'Server' | 'Socket' | 'Writter' | 'Database' | 'Nodemailer';

// 3. Дополнительные популярные примеры для автодополнения
type CustomComponentsHint = 'Redis' | 'Kafka' | 'Telegram';

// Базовый интерфейс статических методов
interface BasePrintInterface {
  NodemailerFunctionPositiveSending(gmail: string): string;
  NodemailerFunctionNegativeSending(gmail: string): string;

  /**
   * 💡 ВЫ МОЖЕТЕ СОЗДАВАТЬ СВОИ ПРЕФИКСЫ!
   * 
   * Паттерн Proxy автоматически поддерживает любые новые компоненты.
   * Просто введите: print.ИмяВашегоКомпонентаМетод(...)
   * 
   * Пример: print.RedisInfo("Connected") или print.TelegramWarn("Alert")
   */
  "[👉 Вы можете вписать любой свой компонент перед Info/Warn/Error]": any;
}

// 4. Главный тип магии Proxy
export type PrintInterface = BasePrintInterface & {
  // Выводим стандартные методы (ServerInfo, DatabaseWarn...)
  [Component in DefaultComponents as `${Component}${keyof ComponentMethods}`]: ComponentMethods[keyof ComponentMethods];
} & {
  // Выводим примеры популярных кастомных компонентов, чтобы они тоже были в списке
  [Component in CustomComponentsHint as `${Component}${keyof ComponentMethods}`]: ComponentMethods[keyof ComponentMethods];
} & {
  // Разрешаем вводить абсолютно любые строки в коде, чтобы не было ошибок компиляции
  [DynamicMethod: string]: any;
} & {
  // Строгая проверка типов для динамических методов, когда пользователь вводит их вручную
  [DynamicMethod in `${string}Info`]: ComponentMethods['Info'];
} & {
  [DynamicMethod in `${string}Error`]: ComponentMethods['Error'];
} & {
  [DynamicMethod in `${string}Warn`]: ComponentMethods['Warn'];
} & {
  [DynamicMethod in `${string}FunctionInfo`]: ComponentMethods['FunctionInfo'];
} & {
  [DynamicMethod in `${string}FunctionStatus`]: ComponentMethods['FunctionStatus'];
} & {
  [DynamicMethod in `${string}FunctionPrint`]: ComponentMethods['FunctionPrint'];
} & {
  [DynamicMethod in `${string}FunctionPositivePerformance`]: ComponentMethods['FunctionPositivePerformance'];
} & {
  [DynamicMethod in `${string}FunctionNegativePerformance`]: ComponentMethods['FunctionNegativePerformance'];
};

// Экспортируем структуру для CommonJS
const logger: {
  print: Readonly<PrintInterface>;
};

export = logger;
