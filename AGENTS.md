# AGENTS.md

Документ описывает требования к учебному проекту "геймерский форум с интеграцией Steam".  
Этот файл предназначен для ИИ-агента, который будет разрабатывать систему с нуля.  
Цель документа. снять все неясности до уровня, достаточного для прямой реализации.

---

## 1. Миссия проекта

Создать веб форум для игроков и разработчиков игр, где

- обычные пользователи логинятся через свой Steam аккаунт  
- могут участвовать в обсуждениях и создавать баг репорты только по тем играм, которые есть в их библиотеке Steam  
- разработчики игр видят только баг репорты и ветки форума по своим играм  
- администратор полностью управляет системой, включая модерацию и выдачу прав

Проект учебный. не предполагается реальный продакшен и высокая нагрузка.  
Приоритет. качество бэкенд архитектуры и демонстрация работы в Docker окружении.  
Фронтенд должен быть достаточно простым, чтобы полноценно демонстрировать функционал.

---

## 2. Роли и сценарии

### 2.1 Роли

В системе три типа пользователей

1. USER  
   - входит через Steam  
   - участвует в обсуждениях только тех игр, которые есть в его Steam библиотеке и которые добавлены администратором в систему  
   - может создавать и просматривать баг репорты только по этим играм  
   - не имеет административных прав  

2. DEVELOPER  
   - аккаунт создается администратором вручную  
   - логинится по email и паролю  
   - привязан к одной или нескольким играм  
   - видит форум и баг репорты только по своим играм  
   - может менять статус баг репортов по своим играм  

3. ADMIN  
   - аккаунт создается вручную или через начальный seed  
   - логинится по email и паролю  
   - имеет полный доступ  
   - добавляет игры  
   - создает аккаунты разработчиков и привязывает их к играм  
   - модерирует форум  
   - одобряет или отклоняет баг репорты до передачи разработчикам  
   - банит пользователей и может делать любые изменения в данных форума

### 2.2 Краткое описание сценариев по ролям

#### USER

- Войти через Steam  
- На странице списка игр увидеть игры, по которым существует форум  
- Для игр, которые присутствуют и в его Steam библиотеке, пользователь может  
  - просматривать ветки обсуждений  
  - создавать новые ветки  
  - отвечать в существующих ветках  
  - создавать баг репорты  
  - просматривать одобренные баг репорты  

#### DEVELOPER

- Войти по email и паролю  
- Увидеть список только тех игр, к которым он привязан  
- Для каждой из своих игр  
  - просматривать ветки форума  
  - просматривать баг репорты, одобренные администратором  
  - изменять статус баг репорта  

#### ADMIN

- Войти по email и паролю  
- Управлять играми  
  - создавать, редактировать, удалять  
- Управлять пользователями  
  - создавать разработчиков  
  - назначать им игры  
  - банить любых пользователей  
- Управлять форумом  
  - удалять темы и сообщения  
  - помечать сообщения как спойлер  
  - блокировать темы  
- Управлять баг репортами  
  - просматривать все  
  - менять их статус как администратор  
  - решать, какие репорты видны разработчику  

---

## 3. Технологический стек

Бэкенд является ключевым.  
Ниже набор технологий, которые нужно использовать.

### 3.1 Backend

- Язык. TypeScript  
- Фреймворк. NestJS  
- ORM. Prisma  
- База данных. PostgreSQL  
- Аутентификация  
  - Steam. через OpenID 2.0 используя стратегию на базе passport и passport steam  
  - Локальная аутентификация. email и пароль для разработчиков и администраторов, хранение пароля в виде bcrypt хеша  
- Формат API. REST  
- Документация API. Swagger, встроенный в NestJS

### 3.2 Frontend

Проект учебный.  
Фронтенд должен быть достаточно простым, но демонстрировать основные сценарии.

- React  
- Сборщик. Vite  
- Можно использовать простую UI библиотеку, например MUI, или обойтись без нее

Фронтенд может быть отдельным приложением, общающимся с бэкендом по REST API.

### 3.3 Docker и окружение

Использовать Docker и docker compose.  
Минимальный набор сервисов.

- api. контейнер NestJS  
- db. контейнер postgres  
- db admin. например, pgadmin или adminer  
- frontend. по возможности отдельный контейнер, обслуживаемый через nginx, но это необязательно

Нужен один docker compose файл, который поднимает всю систему командой  
`docker compose up`.

---

## 4. Архитектура и модули бэкенда

### 4.1 Общая архитектура

Использовать модульный подход NestJS.

Минимальный список модулей

- AuthModule  
- UsersModule  
- GamesModule  
- ForumModule  
  - ThreadsSubmodule  
  - PostsSubmodule  
- BugReportsModule  
- AdminModule  
- DevelopersModule  

AuthModule должен содержать

- стратегию для Steam  
- стратегию для локальной аутентификации  
- guard для JWT или другого выбранного механизма сессий  

### 4.2 Модуль Auth

Функции модуля

1. Аутентификация через Steam для роли USER  
2. Аутентификация по email и паролю для ролей DEVELOPER и ADMIN  
3. Выдача токенов доступа  
   - JWT или HTTP only cookie  

Обязательные эндпоинты

- `GET /auth/steam`  
  - перенаправление пользователя на Steam для авторизации  
- `GET /auth/steam/callback`  
  - обработка ответа от Steam  
  - создание или обновление пользователя с ролью USER  
  - синхронизация списка игр пользователя  
- `POST /auth/login`  
  - вход по email и паролю для ADMIN и DEVELOPER  
- `POST /auth/logout`  
  - опционально, если используется cookie стратегия

Guard для ролей должен

- извлекать роль пользователя из токена  
- проверять наличие требуемой роли или списка ролей на маршруте

### 4.3 Модуль Users

Ответственность

- хранение данных обо всех типах пользователей  
- управление базовыми атрибутами  
- бан пользователей  

Эндпоинты для администрации

- `GET /admin/users`  
- `PATCH /admin/users/:id/ban`  

### 4.4 Модуль Games

Ответственность

- управление списком игр, доступных в системе  

Требования

- Игры добавляет только администратор вручную  
- У каждой игры есть связанный Steam app id  
- В библиотеку USER попадают только те игры, которые и в Steam библиотеке, и есть в таблице Games  

Эндпоинты

- `GET /games`  
  - доступны всем  
  - могут возвращать признак, есть ли игра у текущего пользователя  
- `POST /games`  
  - только для ADMIN  
- `PATCH /games/:id`  
  - только для ADMIN  
- `DELETE /games/:id`  
  - только для ADMIN  

### 4.5 Модуль Forum

Разбить на Threads и Posts.

#### Threads

Ответственность

- управление ветками обсуждения игры  

Эндпоинты

- `GET /games/:gameId/threads`  
  - доступны всем  
- `POST /games/:gameId/threads`  
  - только для USER с этой игрой в библиотеке и не забаненных  
- `GET /threads/:id`  
- `PATCH /threads/:id`  
  - редактирование автором или администратором  
- `DELETE /threads/:id`  
  - ADMIN  
- `PATCH /threads/:id/lock`  
  - ADMIN  

#### Posts

Ответственность

- управление сообщениями в ветках  

Эндпоинты

- `GET /threads/:threadId/posts`  
- `POST /threads/:threadId/posts`  
  - только для USER с этой игрой в библиотеке  
- `PATCH /posts/:id`  
  - автор или ADMIN  
- `DELETE /posts/:id`  
  - ADMIN  
- `PATCH /posts/:id/spoiler`  
  - ADMIN, меняет флаг спойлера

### 4.6 Модуль BugReports

Ответственность

- создание и управление баг репортами  

Сущности

- BugReport  
- BugReportComment  
- BugReportStatusChangeLog  

Статусы баг репортов

Предлагаемый набор

- `PENDING_ADMIN`  
  - только что создан пользователем, виден админу  
- `REJECTED_BY_ADMIN`  
  - отклонен администратором  
- `VISIBLE_TO_DEV`  
  - одобрен администратором и виден разработчику  
- `IN_PROGRESS`  
  - разработчик начал работу  
- `FIXED`  
  - баг исправлен  
- `CLOSED`  
  - баг закрыт  

Правила видимости

- USER  
  - видит свои баг репорты любых статусов  
  - видит чужие баг репорты только тех статусов, которые Вы зададите. минимум надо показать те, что `VISIBLE_TO_DEV`, `IN_PROGRESS`, `FIXED`, `CLOSED`  
- DEVELOPER  
  - видит только баг репорты по своим играм  
  - не видит репорты в статусах `PENDING_ADMIN` и `REJECTED_BY_ADMIN`  
- ADMIN  
  - видит все  

Эндпоинты

- `POST /games/:gameId/bug-reports`  
  - создание баг репорта пользователем  
  - предварительно проверяется, что игра есть в библиотеке USER  
  - начальный статус. `PENDING_ADMIN`  
- `GET /games/:gameId/bug-reports`  
  - список репортов с фильтрацией по ролям  
- `GET /bug-reports/:id`  

Администратор

- `PATCH /bug-reports/:id/admin-review`  
  - входные параметры. решение администратора и комментарий  
  - возможные действия  
    - перевести в `VISIBLE_TO_DEV`  
    - перевести в `REJECTED_BY_ADMIN`  

Разработчик

- `PATCH /bug-reports/:id/status`  
  - разработчик может переводить статус  
    - из `VISIBLE_TO_DEV` в `IN_PROGRESS`, `FIXED`, `CLOSED`  
    - из `IN_PROGRESS` в `FIXED` или `CLOSED`  
  - дополнительно сохраняется запись в логе статусов

### 4.7 Модуль Admin и Developers

AdminModule

- эндпоинты для  
  - управления пользователями  
  - управления играми  
  - проверки и модерации баг репортов  
  - модерации форума  

DevelopersModule

- эндпоинты для  
  - просмотра списка баг репортов по своим играм  
  - изменения статусов репортов  

---

## 5. Модель данных

Использовать Prisma.  
Ниже привести ориентировочную схему.  
ИИ агент должен доработать ее самостоятельно при необходимости, но не менять семантику.

```prisma
model User {
  id            Int       @id @default(autoincrement())
  email         String?   @unique
  passwordHash  String?
  steamId       String?   @unique
  role          UserRole
  isBanned      Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  developerGames DeveloperGame[]
  bugReports     BugReport[] @relation("BugReportsByAuthor")
  threads        Thread[]
  posts          Post[]
}

enum UserRole {
  USER
  DEVELOPER
  ADMIN
}

model Game {
  id           Int            @id @default(autoincrement())
  steamAppId   Int            @unique
  title        String
  description  String?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  developerGames DeveloperGame[]
  userGames       UserGame[]
  threads         Thread[]
  bugReports      BugReport[]
}

model DeveloperGame {
  developerId Int
  gameId      Int

  developer User @relation(fields: [developerId], references: [id])
  game      Game @relation(fields: [gameId], references: [id])

  @@id([developerId, gameId])
}

model UserGame {
  userId       Int
  gameId       Int
  lastSyncedAt DateTime?

  user User @relation(fields: [userId], references: [id])
  game Game @relation(fields: [gameId], references: [id])

  @@id([userId, gameId])
}

model Thread {
  id        Int      @id @default(autoincrement())
  gameId    Int
  authorId  Int
  title     String
  isDeleted Boolean  @default(false)
  isLocked  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  game   Game   @relation(fields: [gameId], references: [id])
  author User   @relation(fields: [authorId], references: [id])
  posts  Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  threadId  Int
  authorId  Int
  content   String
  isDeleted Boolean  @default(false)
  isSpoiler Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  thread Thread @relation(fields: [threadId], references: [id])
  author User   @relation(fields: [authorId], references: [id])
}

model BugReport {
  id          Int                 @id @default(autoincrement())
  gameId      Int
  authorId    Int
  title       String
  description String
  status      BugReportStatus
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  game      Game   @relation(fields: [gameId], references: [id])
  author    User   @relation("BugReportsByAuthor", fields: [authorId], references: [id])
  comments  BugReportComment[]
  statusLog BugReportStatusChange[]
}

enum BugReportStatus {
  PENDING_ADMIN
  REJECTED_BY_ADMIN
  VISIBLE_TO_DEV
  IN_PROGRESS
  FIXED
  CLOSED
}

model BugReportComment {
  id          Int      @id @default(autoincrement())
  bugReportId Int
  authorId    Int
  content     String
  createdAt   DateTime @default(now())

  bugReport BugReport @relation(fields: [bugReportId], references: [id])
  author    User      @relation(fields: [authorId], references: [id])
}

model BugReportStatusChange {
  id          Int              @id @default(autoincrement())
  bugReportId Int
  changedById Int
  oldStatus   BugReportStatus
  newStatus   BugReportStatus
  createdAt   DateTime         @default(now())

  bugReport BugReport @relation(fields: [bugReportId], references: [id])
  changedBy User      @relation(fields: [changedById], references: [id])
}

6. Правила доступа и проверок

ИИ агент обязан реализовать централизованную проверку прав.
Рекомендуется использовать NestJS Guards плюс сервис авторизации.

Ключевые правила

Только USER с этой игрой в UserGame может

создавать Thread по игре

писать Post в Thread по игре

создавать BugReport по игре

DEVELOPER видит только

Threads и Posts по играм, связанным с ним в DeveloperGame

BugReports по этим играм, статус которых не PENDING_ADMIN и не REJECTED_BY_ADMIN

ADMIN видит и может изменять все объекты.

Забаненный пользователь не может создавать Threads, Posts или BugReports.

При изменении статуса BugReport

проверяется роль

записывается запись в BugReportStatusChange

7. Синхронизация с Steam

Проект учебный. поэтому можно упростить

синхронизировать библиотеку игр пользователя только при первом логине через Steam

или по кнопке "обновить библиотеку", если она будет реализована

Требования

При успешной авторизации через Steam

получить SteamId

запросить список игр пользователя через Steam Web API

из полученного списка отфильтровать только те игры, которые существуют в таблице Game по полю steamAppId

для каждого совпадения создать или обновить запись в UserGame

Не нужно делать сложный кеш или фоновую синхронизацию, так как нагрузка низкая и проект учебный.

8. Frontend. минимальные страницы

ИИ агент должен реализовать минимальный, но рабочий фронтенд.

Роли должны быть очевидно различимы при демонстрации.
Можно использовать разные страницы для администратора, разработчика и обычного пользователя.

Минимальные страницы

Страница входа

кнопка "Войти через Steam"

форма входа по email и паролю

Страница списка игр

для USER

список игр, доступных в системе

визуальный признак, какие есть в его библиотеке

для ADMIN

тот же список плюс кнопка "добавить игру"

Страница игры

вкладка "Форум"

список Threads

форма создания новой ветки, если у пользователя есть игра

вкладка "Баг репорты"

список баг репортов с отображением статусов

форма создания репорта, если у пользователя есть игра

Панель администратора

список пользователей с возможностью банить

список баг репортов со статусом PENDING_ADMIN

интерфейс для одобрения или отклонения репортов

Панель разработчика

список его игр

список баг репортов по выбранной игре

форма изменения статуса репорта

Фронтенд может использовать простую авторизацию по токену.
Важно, чтобы каждое ключевое действие из требований было достижимо.

9. Docker и окружение

ИИ агент должен подготовить

Dockerfile для backend

сборка NestJS приложения

запуск с использованием переменных окружения

Dockerfile для frontend

сборка React приложения

опционально nginx для раздачи

docker compose файл

сервис api

сервис db

сервис db admin

сервис frontend

Пример переменных окружения для backend

DATABASE_URL

STEAM_API_KEY

STEAM_OPENID_RETURN_URL

JWT_SECRET

ADMIN_DEFAULT_EMAIL, ADMIN_DEFAULT_PASSWORD для seed

10. Этапы реализации для ИИ агента

Рекомендуемый порядок разработки

Создать репозиторий проекта. настроить базовую структуру backend и docker compose

Поднять PostgreSQL в Docker. добавить Prisma. описать модель данных. выполнить миграции и seed с админом и тестовыми данными

Реализовать AuthModule

локальная авторизация

роли и guards

Реализовать GamesModule и базовые CRUD эндпоинты

Реализовать ForumModule

Threads и Posts

проверки принадлежности игры

Добавить интеграцию с Steam

маршруты для авторизации

синхронизация UserGame

Реализовать BugReportsModule, включая статусы и логи

Реализовать AdminModule и DevelopersModule

Поднять и связать фронтенд

Подготовить минимальную документацию Swagger и инструкцию по запуску через docker compose