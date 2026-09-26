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

type DefaultComponents = 'Server' | 'Socket' | 'Writter' | 'Database' | 'Nodemailer';

interface BasePrintInterface {
  NodemailerFunctionPositiveSending(gmail: string): string;
  NodemailerFunctionNegativeSending(gmail: string): string;
}

export type PrintInterface = BasePrintInterface & {
  [Component in DefaultComponents as `${Component}${keyof ComponentMethods}`]: ComponentMethods[keyof ComponentMethods];
} & {
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

// В ESM используем стандартный синтаксис экспорта
export const print: Readonly<PrintInterface>;
export default print;
