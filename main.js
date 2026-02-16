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

    const response = await fetch('/api/apply', {
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
    messageEl.textContent = 'Ошибка отправки. Попробуй ещё раз чуть позже.';
    messageEl.className = 'form-message error';
  }
});
