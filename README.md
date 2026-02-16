# Сферы — landing + serverless form delivery

Одностраничный лендинг с формой заявки и серверной обработкой `POST /api/apply`.

## Что реализовано

- Лендинг в минималистичном стиле (mobile-first, анимации появления блоков, адаптивная сетка).
- Отдельная страница `privacy.html`.
- Форма заявки с обязательным согласием на обработку персональных данных.
- Серверная отправка заявки одновременно:
  - в Telegram-группу (ботом),
  - на email `agapov.kirill@gmail.com`.

## Переменные окружения

Скопируйте `.env.example` и задайте значения:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `TO_EMAIL` (по умолчанию можно оставить `agapov.kirill@gmail.com`)

## Локальный запуск

```bash
npm install
npx vercel dev --listen 3000
```

Откройте: `http://localhost:3000`

## Деплой

Проект подходит для деплоя на Vercel:

- статические файлы — как фронтенд,
- `api/apply.js` — serverless функция.
