# Подключения к БД и управление сессиями

Этот документ описывает, как приложение `Knowledge Vault` работает с MongoDB в разных средах (development/production и test), а также как настроена инфраструктура сессий поверх `express-session` и `connect-mongo`.

---

## Подключение к MongoDB

### Общее устройство

1. **Конфигурация**: значения читаются через пакет [`config`](https://www.npmjs.com/package/config). Источниками выступают файлы `config/default.json`, `config/test.json`, а также переменные окружения, описанные в `config/custom-environment-variables.json`.
2. **Инициализация**: в `src/server.js` вызывается `require("dotenv").config()` (поддержка `.env`), после чего подключение к БД делает функция `connectDB` из `src/config/db.js`.
3. **Функция `connectDB`**: вызывает `mongoose.connect(MONGO_URI)` и логирует «MongoDB connected». Любые ошибки пробрасываются наружу.
4. **Обработка ошибок запуска**: если промис `connectDB()` отклоняется, сервер логирует ошибку и не стартует HTTP-listener.
5. **Глобальные перехватчики**: `unhandledRejection` и `uncaughtException` приводят процесс к аккуратному завершению — это важно для задач деплоймента и мониторинга.

### Development / Production

- **Источник строки подключения**: `config/default.json` + переменные окружения (например, `MONGO_URI` в `.env`).
- **Последовательность старта**:
  1. `server.js` загружает конфиг, подключается к MongoDB.
  2. После успешного подключения импортируется `app.js` и запускается `app.listen(PORT)`.
  3. Express-приложение уже к этому моменту настроено на использование общего экземпляра `mongoose`, поэтому дополнительные подключения не создаются.
- **Сессии**: `connect-mongo` может повторно использовать клиент Mongoose (подробнее — в разделе «Сессии»). Это снижает количество TCP-соединений и упрощает управление ресурсами.
- **Логирование**: при каждом запуске выводится «MongoDB connected», что помогает быстро диагностировать проблемы окружения.

### Тестовая среда

- **In-memory Mongo**: файл `tests/utils/memory-mongo.js` поднимает `MongoMemoryServer`. После вызова `startMemoryMongo()` переменная `process.env.MONGO_URI` переписывается на URI временной базы.
- **Инициализация в тестах**:
  1. Хук `beforeAll` из `tests/test.setup.js` запускает in-memory сервер и вызывает `connectDB()` — тот же код, что и в runtime приложения.
  2. В `afterEach` все коллекции очищаются (`deleteMany({})`), чтобы тесты оставались независимыми друг от друга.
  3. В `afterAll` соединение с Mongoose закрывается, in-memory сервер останавливается.
- **Преимущества схемы**: тесты выполняются быстро, не требуют внешнего сервиса и работают с реальным инстансом MongoDB, что повышает достоверность интеграционных сценариев.

---

## Управление сессиями

### Компоненты

- `src/middleware/session.middleware.js` — объявление и экспорт `sessionMiddleware` и используемого хранилища (`store`).
- `express-session` — генерирует cookie `connect.sid`, хранит идентификатор сессии и данные в выбранном Storage.
- `connect-mongo` — обеспечивает хранение сессий в MongoDB (коллекция `sessions`).

### Логика выбора хранилища

1. **Тестовый режим (`NODE_ENV === "test"`)**

   - Используется `session.MemoryStore()`.
   - Причина: тесты не нуждаются в реальном Mongo-сторе и таким образом избавляются от лишних асинхронных зависимостей. Дополнительно `mongodb-memory-server` очищает данные между тестами.

2. **Development / Production**
   - Сначала middleware проверяет, есть ли активное подключение Mongoose (`mongoose.connection?.readyState === 1`).
   - Если да — реиспользуется текущий клиент (`mongoose.connection.getClient()`), и `MongoStore` цепляется к нему.
   - Если нет — создаётся новый клиент `MongoStore.create({ mongoUrl: MONGO_URI, ... })`, и в лог (`logger.warn`) отправляется предупреждение: «Session store initialized before DB connection». Это сигнал, что порядок инициализации стоит пересмотреть, чтобы избежать двух подключений.
   - Параметры store: `collectionName: "sessions"`, `ttl: 24 часа`.

### Настройки cookie

- `httpOnly: true` — cookie недоступно через `document.cookie`.
- `sameSite: "lax"` — защита от CSRF при переходах; в будущем можно ужесточить.
- `secure: false` — в продакшне требуется переключить на `true`, чтобы cookie передавалось только по HTTPS.
- `maxAge: 24 * 60 * 60 * 1000` — сутки.

### Работа в HTTP-потоке

- Middleware навешивается в `app.js` до роутов, поэтому `req.session` доступна во всех хендлерах.
- **Гарды**:
  - `requireGuest` проверяет отсутствие `req.session.userId` и блокирует повторный логин.
  - `requireAuth` требует наличие `userId` в сессии, иначе возвращает 401.
- **Login** (`auth.controller.loginUser`):
  1. После проверки учётных данных вызывается `regenerateSession(req)` — обёртка над `req.session.regenerate()` для предотвращения session fixation.
  2. В новую сессию записывается `userId`.
- **Logout / Delete user**: используется `destroySession(req)` (обёртка над `req.session.destroy`). После успешного вызова очищается cookie через `res.clearCookie("connect.sid")`.
- **Reset password**: независимо от исходной сессии, при успешном сбросе пароля вызывается `destroySession`, чтобы принудительно разлогинить пользователя.

### Сессии в тестах

- Благодаря `request.agent` (Supertest) можно сохранять cookie между запросами.
- В `tests/test.routes.js` есть вспомогательные маршруты (`/test/session/:userId`, `/test/touch`), которые помогают создавать фейковые сессии или проверять регенерацию SID.
- MemoryStore не требует отдельной очистки — при каждом `afterEach` база данных инициализируется заново, а процесс теста стартует с чистыми данными.

---

## Рекомендации и TODO

2. **Production hardening**:
   - Включить `cookie.secure = true` и `cookie.sameSite = "strict"` (если фронтенд работает на том же домене) перед деплоем.
   - Добавить `proxy`-форсирование (например, `app.set("trust proxy", 1)`) при использовании за обратным прокси, чтобы `express-session` правильно выставлял `secure`.
3. **Мониторинг БД**: стоит добавить метрики/health-check, которые проверяют состояние соединения с MongoDB (например, `mongoose.connection.readyState`).
4. **Тесты**: можно добавить unit-тесты для `session.middleware`, чтобы проверить сценарий с предупреждением и выбором клиента Mongoose.
