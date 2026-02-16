const nodemailer = require('nodemailer');

const requiredFields = ['name', 'age', 'occupation', 'motivation', 'contact', 'consent'];

function validatePayload(payload) {
  for (const field of requiredFields) {
    if (!(field in payload)) {
      return `Отсутствует поле: ${field}`;
    }
  }

  if (!payload.consent) {
    return 'Необходимо согласие на обработку данных';
  }

  if (!Number.isFinite(Number(payload.age)) || Number(payload.age) < 18 || Number(payload.age) > 99) {
    return 'Некорректный возраст';
  }

  return null;
}

function renderText(data) {
  return `Новая заявка в клуб «Сферы»\n\nИмя: ${data.name}\nВозраст: ${data.age}\nРод деятельности: ${data.occupation}\nКонтакт: ${data.contact}\n\nПочему хочет вступить:\n${data.motivation}`;
}

async function sendToTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error('Telegram env vars are not set');
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Telegram error: ${details}`);
  }
}

async function sendEmail(text, data) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  const to = process.env.TO_EMAIL || 'agapov.kirill@gmail.com';

  if (!host || !user || !pass || !from) {
    throw new Error('SMTP env vars are not set');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to,
    subject: `Новая заявка «Сферы»: ${data.name}`,
    text,
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = req.body || {};
    const error = validatePayload(payload);

    if (error) {
      return res.status(400).json({ error });
    }

    const text = renderText(payload);

    await Promise.all([sendToTelegram(text), sendEmail(text, payload)]);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Ошибка отправки заявки' });
  }
};
