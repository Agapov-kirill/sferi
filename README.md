# Сферы — single-page landing + serverless форма

Готовый проект: `index.html`, `privacy.html`, `styles.css`, `script.js`, `api/apply.js` и инфраструктура для Vercel.

## Что внутри

- Тёмный SaaS-стиль (blue/black), glow-эффекты, glass-карточки, адаптив.
- Анимации появления блоков на `IntersectionObserver` + micro-interactions.
- Tabs-блок форматов: онлайн / офлайн Москва.
- Форма с:
  - hidden `format` (`online_free / online_paid / offline_moscow`),
  - honeypot (`website`) от простого спама,
  - обязательным согласием и ссылкой на privacy.
- Serverless endpoint `/api/apply`:
  - валидация,
  - проверка honeypot,
  - простой rate-limit по IP,
  - одновременная отправка в Telegram и на email.

## Установка и запуск

```bash
npm install
npx vercel dev --listen 3000
```

Открой: `http://localhost:3000`.

## ENV переменные

Скопируй `.env.example` в `.env` и задай значения:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `SMTP_TO` (по умолчанию `agapov.kirill@gmail.com`)

## Telegram: как получить данные

1. Создай бота через `@BotFather` и возьми токен.
2. Добавь бота в нужную группу/чат и выдай право писать сообщения.
3. Получи `CHAT_ID`:
   - отправь сообщение в группу,
   - открой `https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates`,
   - найди `chat.id` нужного чата.

## Проверка отправки формы

1. Запусти `vercel dev` с заполненными ENV.
2. Отправь форму с сайта.
3. Проверь, что заявка пришла:
   - в Telegram,
   - на email (`SMTP_TO`).

Формат сообщения:

- Новая заявка — Сферы
- Формат
- Имя
- Возраст
- Род деятельности
- Контакт
- Почему хочет вступить
- Дата/время
- Источник: landing

## Деплой

### Vercel (рекомендуется)

- Импортируй репозиторий в Vercel.
- Добавь ENV из раздела выше.
- Деплой автоматически поднимет статику и `/api/apply`.

### GitHub Pages

GitHub Pages раздаёт только статику. `api/apply.js` на github.io не выполняется.
Если нужен Pages-домен, оставь фронт на Pages, а backend вынеси на Vercel и укажи абсолютный URL в `data-api-endpoint` у `<body>`.
