# GameForum Backend

Учебный NestJS/Prisma бэкенд для геймерского форума с интеграцией Steam. Сервис покрывает все роли (USER, DEVELOPER, ADMIN), проверяет права доступа, ведет лог смены статусов баг репортов и поднимается в Docker вместе с PostgreSQL и pgAdmin.

## Возможности
- Авторизация через Steam (passport-steam) и локальный логин для администраторов и разработчиков
- Централизованная проверка прав, бан пользователей, модерация форума и баг репортов
- Модульная архитектура (Auth, Users, Games, Forum, BugReports, Admin, Developers)
- Prisma ORM + миграции и сидер с тестовыми данными
- Swagger (`/api/docs`) и JWT-защищенные REST эндпоинты
- Dockerfile и `docker compose` для api + PostgreSQL + pgAdmin

## Требования
- Node.js 20+
- npm 10+
- PostgreSQL 15+ (если запускаете без Docker)

## Локальный запуск
```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```
API будет доступен на `http://localhost:3000/api` (Swagger на `/api/docs`).

### Полезные скрипты
- `npm run prisma:generate` — обновить клиент после правок schema.prisma
- `npm run prisma:migrate:dev` — создать новую миграцию
- `npm run prisma:migrate:deploy` — применить миграции (использует Docker container)
- `npm run db:seed` — повторить сидирование

## Docker
На уровне корня репозитория лежит `docker-compose.yml`. Запуск всего окружения:
```bash
docker compose up --build
```
Сервисы:
- `db`: PostgreSQL 16 (`localhost:5432`)
- `adminer`: pgAdmin4 (`http://localhost:5050`, логин `admin@graygay.local` / `admin`)
- `api`: собранный NestJS сервер (`http://localhost:3000`)

Переменные окружения для контейнера можно переопределять через переменные хоста (см. `docker-compose.yml`).

## Учётные записи по умолчанию
После `npm run db:seed` доступны:
- ADMIN — `admin@example.com` / `password123`
- DEVELOPER — `dev@example.com` / `devpass`
- USER — `user@example.com` / `userpass` (имитация Steam пользователя)

## Структура модулей
- `AuthModule`: Steam + локальная аутентификация, JWT, Guards
- `UsersModule`: профили, бан пользователей
- `GamesModule`: CRUD по играм и индикатор библиотеки
- `ForumModule`: Threads & Posts c проверкой владения игрой и блокировками
- `BugReportsModule`: статусы, комментарии, лог смены статусов
- `AdminModule`: управление пользователями и проверка репортов
- `DevelopersModule`: список игр разработчика и репорты по ним

## Swagger и Postman
После запуска переходите на `http://localhost:3000/api/docs` — там описаны все REST эндпоинты и модели.

## Steam интеграция
Для реальной работы укажите корректные `STEAM_API_KEY` и `STEAM_OPENID_RETURN_URL` в `.env`. В учебном режиме можно оставить заглушки — сервис будет проходить OAuth, а синхронизация библиотеки просто очистит `UserGame`, если API ключ не задан.

