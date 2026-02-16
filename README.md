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

## GitHub Pages (чтобы сайт обновлялся без «старой версии»)

В репозиторий добавлен workflow `.github/workflows/deploy-pages.yml`, который публикует текущий `main` в GitHub Pages на каждый push.

Проверьте в GitHub:

1. `Settings → Pages`.
2. В `Source` должно быть **GitHub Actions**.
3. После merge в `main` дождитесь успешного workflow `Deploy static site to GitHub Pages`.

Если видите старую страницу:

- убедитесь, что изменения действительно попали в `main` (а не только в PR/другой branch),
- откройте страницу в hard reload (`Ctrl/Cmd + Shift + R`),
- либо добавьте `?v=2` к URL для обхода кэша браузера.

> Важно: GitHub Pages раздаёт только статику. `api/apply.js` на github.io не выполняется. Для рабочей отправки формы используйте Vercel/Netlify или отдельный backend URL.
