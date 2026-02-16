const reveals = document.querySelectorAll('.reveal');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const formatButtons = document.querySelectorAll('.js-format');
const formatField = document.getElementById('format-field');

const ICONS = {
  clarity:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M12 4v16"/><circle cx="12" cy="12" r="8"/></svg>',
  support:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20v-8"/><path d="M8 12a4 4 0 1 1 8 0"/><path d="M5 20h14"/></svg>',
  feedback:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v10H8l-4 4z"/></svg>',
  network:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="2"/><circle cx="18" cy="7" r="2"/><circle cx="18" cy="17" r="2"/><path d="M8 12h8M16.6 8.4l-8 3.2M16.6 15.6l-8-3.2"/></svg>',
  discipline:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>',
  stability:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16l5-5 4 4 7-7"/><path d="M20 12v-4h-4"/></svg>',
};

function revealOnScroll() {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  reveals.forEach((item) => observer.observe(item));
}

function setupTabs() {
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.tab;

      tabButtons.forEach((el) => {
        const active = el === button;
        el.classList.toggle('is-active', active);
        el.setAttribute('aria-selected', String(active));
      });

      tabPanels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.panel === target));
    });
  });
}

function setupFormatButtons() {
  formatButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const format = button.dataset.format;
      if (formatField && format) {
        formatField.value = format;
      }
    });
  });
}

function injectIcons() {
  document.querySelectorAll('.icon[data-icon]').forEach((node) => {
    const key = node.dataset.icon;
    node.innerHTML = ICONS[key] || '';
  });
}

function setupHeroMetrics() {
  const container = document.getElementById('hero-metrics');
  if (!container) return;

  const metrics = [
    { value: '8', label: 'мест в группе' },
    { value: '12', label: 'сфер роста' },
    { value: '3.5ч', label: 'еженедельно' },
  ];

  container.innerHTML = metrics
    .map((item) => `<div class="metric"><strong>${item.value}</strong><span>${item.label}</span></div>`)
    .join('');
}

function setupHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const circles = Array.from({ length: 22 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 2 + 1,
    vx: (Math.random() - 0.5) * 0.0016,
    vy: (Math.random() - 0.5) * 0.0016,
  }));

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(58,160,255,0.18)');
    gradient.addColorStop(1, 'rgba(27,77,255,0.05)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(130, 182, 255, 0.13)';
    for (let x = 0; x <= width; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 36) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    circles.forEach((p) => {
      if (!reduceMotion) {
        p.x += p.vx;
        p.y += p.vy;
      }
      if (p.x < 0 || p.x > 1) p.vx *= -1;
      if (p.y < 0 || p.y > 1) p.vy *= -1;

      const cx = p.x * width;
      const cy = p.y * height;
      ctx.beginPath();
      ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(225, 240, 255, 0.65)';
      ctx.fill();
    });

    if (!reduceMotion) requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener('resize', resize);
}

function setupCardTilt() {
  const cards = document.querySelectorAll('.card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-3px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 4).toFixed(2)}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

function setupForm() {
  const form = document.getElementById('apply-form');
  const messageEl = document.getElementById('form-message');
  if (!form || !messageEl) return;

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
}

revealOnScroll();
setupTabs();
setupFormatButtons();
injectIcons();
setupHeroMetrics();
setupHeroCanvas();
setupCardTilt();
setupForm();
