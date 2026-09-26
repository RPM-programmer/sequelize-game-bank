# 🎨 custom-color-logs (v3.1.0)

> Продвинутая, легковесная и абсолютно отказоустойчивая (**Poka-yoke**) система логирования для Node.js с динамической кастомизацией цветов и поддержкой Proxy-префиксов через `.env`.

---

[<img src="https://img.icons8.ru/?size=100&id=24895&format=png&color=000000" height="60" align="center"> npm versions](https://www.npmjs.com/package/custom-color-logs?activeTab=versions)
[<img src="https://img.icons8.ru/?size=100&id=24895&format=png&color=000000" height="60" align="center"> На npm](https://www.npmjs.com/package/custom-color-logs/v3.1.0)
[<img src="https://img.icons8.ru/?size=100&id=12599&format=png&color=000000" height="60" align="center"> На GitHub](https://github.com/RPM-programmer/custom-color-logs)
[<img src="https://img.icons8.ru/?size=100&id=dvsOEzqniDma&format=png&color=000000" height="60" align="center"> License](LICENSE)

---

## ⚡️ Ключевые фичи v3.1.0 (The Smart Dynamic Update)

*  **Магия Proxy (Бесконечные префиксы):** Больше не нужно настраивать компоненты внутри библиотеки. Логгер на лету подхватывает любые имена: `print.RedisInfo`, `print.KafkaWarn`.
*  **Умный парсинг CamelCase:** При вызове сложных цепочек вроде `print.DatabaseTelegramWarn` логгер автоматически разобьет имя на красивую иерархию префиксов `SYSTEM:SERVER:DATABASE:TELEGRAM:`.
*  **Единая палитра для кастомных префиксов:** Управляйте цветом и регистром всех динамических модулей всего двумя переменными в `.env`.
*  **Умная раскраска объектов:** Автоматически парсит объекты и массивы. Ключи (properties) и значения (values) красятся в РАЗНЫЕ цвета.
*  **Гибридный пакет (Dual-Package):** Из коробки поддерживает как старый **CommonJS (`require`)**, так и современный **ESM (`import`)**.

---

## 🛠 Настройка через `.env`

При первом запуске логгер автоматически создаст или дополнит ваш файл `.env`. Новые переменные для управления кастомными префиксами:

```env
#  НАСТРОЙКА ДЛЯ ЛЮБЫХ КАСТОМНЫХ ПРЕФИКСОВ (Фича v3.1.0)
# ------------------------------------------------------------------------------
CUSTOM_PREFIX_TEXT_COLOR                     = Cyan     # Цвет для ВСЕХ динамических префиксов (Redis, Telegram и т.д.)
CUSTOM_PREFIX_TEXT_CASE                      = Upper    # Регистр: Upper (по умолчанию), Lower или AsIs (как в коде)

# Настройка умного окрашивания объектов (Фича v3.0.0)
KEY_COLOR=Magenta      # Цвет для ключей (например, name, age)
VALUE_COLOR=Yellow     # Цвет для значений (например, "Иван", 25)
COLOR=Gray             # Цвет для обычного текста лога
```

---

##  Примеры использования

### 1. Импорт логгера

**В среде CommonJS (`require`):**
```javascript
const { print } = require("custom-color-logs");
```

**В среде ESM (`import`):**
```javascript
import { print } from "custom-color-logs";
```

### 2. Базовые и вложенные префиксы
Вы можете использовать стандартные компоненты или придумывать свои прямо на лету:

```javascript
print.ServerInfo("Информационное сообщение сервера"); 
// Выведет: [12:00:00] SYSTEM:SERVER: @info Информационное сообщение

// Умное разделение CamelCase и автоматический Cyan цвет из .env:
print.DatabaseTelegramWarn("Лимит запросов API исчерпан");
// Выведет: [12:00:00] SYSTEM:SERVER:DATABASE:TELEGRAM: @warn Лимит запросов API исчерпан

print.RedisCacheError(new Error("Сбой подключения к сокету"));
// Выведет: [12:00:00] SYSTEM:SERVER:REDIS:CACHE: @error Сбой подключения к сокету
```

### 3. Логирование внутри функций и производительность
```javascript
print.DatabaseFunctionInfo("authCheck", "Проверка сессии пользователя");
print.ServerFunctionPositivePerformance("API_Request", "Время ответа: 45ms");
```

### 4. Умный вывод объектов напрямую
```javascript
const user = { name: "Иван", age: 25, roles: ["admin"] };
print.DatabaseInfo(user);
// В консоли развернется красивый JSON, где 'name' будет Magenta, а '"Иван"' - Yellow!
```

---

##  Поддержка TypeScript & Автодополнение

Библиотека поставляется с полным набором встроенных типов (`index.d.ts` и `index.d.mts`). Благодаря продвинутой маппинг-типизации среда разработки идеально понимает динамическую структуру Proxy.

При вводе `print.` VS Code выведет интерактивную подсказку, напоминающую о возможности создавать свои префиксы, а также строго проверит типы аргументов (например, необходимость передавать имя функции первым аргументом в `FunctionInfo`).

---

## [Лицензия](LICENSE)

ISC © prm-programmer

*  **Контакты:** [GitHub](https://github.com) | [npm Profile](https://npmjs.com)
*  **Почта:** [p7841744@gmail.com](mailto:p7841744@gmail.com)
*  **Viber:** [+375 (44) 521-45-73](viber://chat?number=+375445214573)

###  Нашли ошибку? 
Пишите на [Gmail](mailto:p7841744@gmail.com?subject=Нахождение%20ошибки%20в%20коде&body=Здраствуйте!%20Я%20обнаружил%20ошибку%20в%20коде.%20Она%20появляется%20если%20вызвать%20%28название%20фунции%29.%20Вот%20лог%20ошибки%3A%20%28лог%29%3B%20код%3A%20%28код%20файла%20где%20появляется%20ошибка%29) или в [Viber](viber://chat?number=+375445214573). Пожалуйста, приложите логи и участок кода, вызывающий сбой.
