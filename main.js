const reveals = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

reveals.forEach((block) => revealObserver.observe(block));

const form = document.getElementById('apply-form');
const messageEl = document.getElementById('form-message');
const apiEndpoint = document.body.dataset.apiEndpoint || '/api/apply';

const isGitHubPages = window.location.hostname.endsWith('github.io');
if (isGitHubPages && apiEndpoint.startsWith('/')) {
  console.warn(
    'GitHub Pages не исполняет serverless API. Укажите абсолютный backend endpoint в data-api-endpoint у <body>.'
  );
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const payload = {
    name: String(formData.get('name') || '').trim(),
    age: Number(formData.get('age')),
    occupation: String(formData.get('occupation') || '').trim(),
    motivation: String(formData.get('motivation') || '').trim(),
    contact: String(formData.get('contact') || '').trim(),
    consent: formData.get('consent') === 'on',
  };

  try {
    messageEl.textContent = 'Отправляем заявку...';
    messageEl.className = 'form-message';

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Не удалось отправить заявку');
    }

    messageEl.textContent = 'Спасибо. Я свяжусь с тобой для собеседования.';
    messageEl.className = 'form-message success';

    form.reset();
  } catch (error) {
    if (isGitHubPages && apiEndpoint.startsWith('/')) {
      messageEl.textContent =
        'На GitHub Pages форма не отправляется без внешнего backend URL. Укажи data-api-endpoint в index.html.';
    } else {
      messageEl.textContent = 'Ошибка отправки. Попробуй ещё раз чуть позже.';
    }
    messageEl.className = 'form-message error';
  }
});
