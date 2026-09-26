import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Импортируем наше CommonJS-ядро
const cjsModule = require('./index.js');

// Экспортируем именованную переменную print для синтаксиса `import { print } from ...`
export const print = cjsModule.print;

// Экспортируем по дефолту для синтаксиса `import print from ...`
export default cjsModule.print;
