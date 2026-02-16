const reveals = document.querySelectorAll('.reveal');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const formatButtons = document.querySelectorAll('.js-format');
const formatField = document.getElementById('format-field');

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

reveals.forEach((item) => revealObserver.observe(item));

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.tab;

    tabButtons.forEach((el) => {
      const active = el === button;
      el.classList.toggle('is-active', active);
      el.setAttribute('aria-selected', String(active));
    });

    tabPanels.forEach((panel) => {
      panel.classList.toggle('is-active', panel.dataset.panel === target);
    });
  });
});

formatButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const format = button.dataset.format;
    if (formatField && format) {
      formatField.value = format;
    }
  });
});

const form = document.getElementById('apply-form');
const messageEl = document.getElementById('form-message');
const apiEndpoint = document.body.dataset.apiEndpoint || '/api/apply';

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  const payload = {
    format: String(data.get('format') || 'online_free'),
    name: String(data.get('name') || '').trim(),
    age: Number(data.get('age')),
    occupation: String(data.get('occupation') || '').trim(),
    motivation: String(data.get('motivation') || '').trim(),
    contact: String(data.get('contact') || '').trim(),
    consent: data.get('consent') === 'on',
    website: String(data.get('website') || ''),
  };

  try {
    messageEl.textContent = 'Отправляем заявку...';
    messageEl.className = 'form-message';

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.ok) {
      throw new Error(result.error || 'Ошибка отправки');
    }

    messageEl.textContent = 'Спасибо. Я свяжусь с тобой для собеседования.';
    messageEl.className = 'form-message success';
    form.reset();
    formatField.value = 'online_free';
  } catch {
    messageEl.textContent = 'Ошибка отправки. Попробуй ещё раз чуть позже.';
    messageEl.className = 'form-message error';
  }
});
