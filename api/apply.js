const nodemailer = require('nodemailer');

const ALLOWED_FORMATS = new Set(['online_free', 'online_paid', 'offline_moscow']);
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const ipHits = new Map();

function getIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function checkRateLimit(ip) {
  const now = Date.now();
  const recent = (ipHits.get(ip) || []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    return false;
  }

  recent.push(now);
  ipHits.set(ip, recent);
  return true;
}

function validatePayload(body = {}) {
  const requiredText = ['name', 'occupation', 'motivation', 'contact'];

  for (const field of requiredText) {
    if (!String(body[field] || '').trim()) {
      return `Заполни поле: ${field}`;
    }
  }

  if (!Number.isFinite(Number(body.age)) || Number(body.age) < 18 || Number(body.age) > 99) {
    return 'Некорректный возраст';
  }

  if (!ALLOWED_FORMATS.has(String(body.format || ''))) {
    return 'Некорректный формат участия';
  }

  if (String(body.website || '').trim()) {
    return 'Spam detected';
  }

  if (body.consent !== true) {
    return 'Нужно согласие на обработку данных';
  }

  return null;
}

function formatMessage(data) {
  return [
    'Новая заявка — Сферы',
    `Формат: ${data.format}`,
    `Имя: ${data.name}`,
    `Возраст: ${data.age}`,
    `Род деятельности: ${data.occupation}`,
    `Контакт: ${data.contact}`,
    'Почему хочет вступить:',
    data.motivation,
    `Дата/время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`,
    'Источник: landing',
  ].join('\n');
}

async function sendToTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!response.ok) {
    throw new Error(`Telegram error: ${await response.text()}`);
  }
}

async function sendEmail(text, name) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  const to = process.env.SMTP_TO || 'agapov.kirill@gmail.com';

  if (!host || !user || !pass || !from || !to) {
    throw new Error('Missing SMTP env variables');
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transport.sendMail({
    from,
    to,
    subject: `Новая заявка — Сферы (${name})`,
    text,
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const ip = getIp(req);
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Слишком много запросов, попробуй позже' });
  }

  try {
    const body = req.body || {};
    const validationError = validatePayload(body);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const cleanData = {
      format: String(body.format),
      name: String(body.name).trim(),
      age: Number(body.age),
      occupation: String(body.occupation).trim(),
      motivation: String(body.motivation).trim(),
      contact: String(body.contact).trim(),
    };

    const message = formatMessage(cleanData);

    await Promise.all([sendToTelegram(message), sendEmail(message, cleanData.name)]);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('apply error', error);
    return res.status(500).json({ error: 'Ошибка отправки заявки' });
  }
};
