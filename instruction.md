> # sequelize-game-bank v1.0.0-beta.1

## sequelize-game-bank — npm модуль для создания игрового банка на sequelize
### Модуль использует:
* **bcrypt@6.0.0** - хеширование паролей
* **cookie-parser@1.4.7** - сохранение данных cookie
* **custom-color-logs@3.0.0** - логгер
* **dotenv@18.0.0** - чтение из файлов конфигурации
* **express@5.2.1** - создание сервера
* **jsonwebtoken@9.0.3** - json токены
* **nodemailer@10.0.10** - отправка на почту
* **sequelize@6.37.8** - создание базы данных
* **sqlite3@6.0.1** - ядро базы данных
#### Почему именно **custom-color-logs@3.0.0** — самый стабильный релиз
### Как использовать?:
* __1) Скачивание__
```bash
npm install sequelize-game-bank
```
* __2) Инициализация__
#### В корневом файле в импортах впишите
```javascript
const bank = require("sequelize-game-bank");
```
#### Если не используете express перейдите на него
##### Скачивать ничего не нужно. Он скачается вместе с модулем
```javascript
const app = bank.server.init;
```
