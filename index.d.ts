import { Express } from 'express';

interface BankServer {
  /**
   * 🚀 **Инициализация банковского сервера**
   * 
   * Настраивает экземпляр Express-приложения, автоматически подключает
   * базовые middleware (cookie-parser, json) и регистрирует все роуты:
   * - Авторизация (`/api/users/*`)
   * - Работа со счетами (`/api/accounts/*`)
   * - Панель администратора (`/api/admin/*`)
   * 
   * @returns {Express} Готовое к запуску приложение Express (нужно вызвать `.listen()`).
   * 
   * @example
   * const app = bank.server.init();
   * app.listen(3000, () => console.log('Server running on port 3000'));
   */
  init(): Express;
}

interface Bank {
  server: BankServer;
}

declare const bank: Bank;
export = bank;
