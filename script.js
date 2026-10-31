'use strict';

/* ================= CONFIG (edit these) ================= */
const WHATSAPP_NUMBER = '2340000000001'; // FICTIONAL placeholder: replace with a real number (country code, no +)
const IMG = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=700&q=75`;

const SERVICES = [
  { name: 'Cleaning Services', img: '1581578731548-c64695cc6952', desc: 'Deep cleaning for homes, offices and post-construction sites.', alt: 'Cleaner wiping down a kitchen counter' },
  { name: 'Plumbing', img: '1585704032915-c3400ca199e7', desc: 'Leak repairs, installations and drainage solutions.', alt: 'Plumber repairing a pipe under a sink' },
  { name: 'Electrical Works', img: '1621905251189-08b45d6a269e', desc: 'Safe wiring, fittings, inverter and generator connections.', alt: 'Electrician working on a circuit panel' },
  { name: 'AC & Appliance Repair', img: '1631545806609-1a4c7d0a5a0a', desc: 'Servicing and repair for air conditioners and home appliances.', alt: 'Technician servicing an air conditioning unit' },
  { name: 'Painting & Décor', img: '1562259949-e8e7689d7828', desc: 'Neat interior and exterior painting with quality finishes.', alt: 'Painter rolling fresh paint onto a wall' },
  { name: 'Security & CCTV', img: '1557862921-37829c790f19', desc: 'CCTV, alarm and access-control installation and support.', alt: 'Security camera mounted on a building wall' }
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const waLink = msg => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

/* ================= Services + select options ================= */
function initServices() {
  $('#serviceGrid').innerHTML = SERVICES.map((s, i) => `
    <article class="svc reveal" style="transition-delay:${i * 70}ms">
      <div class="thumb"><img src="${IMG(s.img)}" alt="${s.alt}" loading="lazy" width="700" height="440"></div>
      <div class="body">
        <h3>${s.name}</h3>
        <p>${s.desc}</p>
        <a class="btn btn-line" href="#contact" data-service="${s.name}">Request ${s.name.split(' ')[0]} Service</a>
      </div>
    </article>`).join('');

  $('#service').innerHTML = '<option value="">Select a service…</option>' +
    [...SERVICES.map(s => s.name), 'Other / Not sure'].map(n => `<option>${n}</option>`).join('');

  // Hide broken images gracefully (the tinted placeholder behind shows instead)
  $$('.svc img').forEach(img => img.addEventListener('error', () => { img.style.display = 'none'; }, { once: true }));

  // Service CTA pre-selects the service in the form
  $('#serviceGrid').addEventListener('click', e => {
    const a = e.target.closest('[data-service]');
    if (a) $('#service').value = a.dataset.service;
  });
}

/* ================= Navigation ================= */
function initNav() {
  const btn = $('#navToggle'), nav = $('#nav');
  const set = open => { nav.classList.toggle('open', open); btn.setAttribute('aria-expanded', open); };
  btn.addEventListener('click', () => set(!nav.classList.contains('open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { set(false); btn.focus(); } });

  // Highlight current section link
  const links = $$('a[href^="#"]', nav).filter(a => !a.classList.contains('btn'));
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    links.forEach(l => {
      const on = l.getAttribute('href') === '#' + en.target.id;
      l.classList.toggle('active', on);
      on ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current');
    });
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => io.observe(s));
}

/* ================= Contact form (frontend demo) ================= */
function initForm() {
  const form = $('#quoteForm'), result = $('#formResult');
  const rules = {
    name:    v => v.trim().length >= 2 || 'Please enter your full name.',
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter a valid email address.',
    phone:   v => /^[+()\d\s-]{7,18}$/.test(v.trim()) || 'Enter a valid phone number.',
    service: v => !!v || 'Please choose a service.'
  };
  const check = id => {
    const f = $('#' + id), r = rules[id](f.value), err = $('#' + id + 'Err');
    const ok = r === true;
    err.textContent = ok ? '' : r;
    f.setAttribute('aria-invalid', !ok);
    if (!ok) f.setAttribute('aria-describedby', id + 'Err'); else f.removeAttribute('aria-describedby');
    return ok;
  };
  Object.keys(rules).forEach(id => $('#' + id).addEventListener('blur', () => check(id)));

  form.addEventListener('submit', e => {
    e.preventDefault();
    const results = Object.keys(rules).map(check);          // validate every field
    if (results.includes(false)) { $('[aria-invalid="true"]', form).focus(); return; }

    const d = Object.fromEntries(new FormData(form));
    const msg = `Hello Eddies Service Company, I'd like a quote.\nName: ${d.name}\nPhone: ${d.phone}\nEmail: ${d.email}\nService: ${d.service}\nDetails: ${d.message || 'N/A'}`;
    result.className = 'result ok';
    result.innerHTML = `<strong>Thank you, ${d.name.split(' ')[0]}!</strong> Your request was checked successfully. (Demo: nothing was sent to a server.) Send it to us now via WhatsApp:<br>
      <a class="btn btn-wa" href="${waLink(msg)}" target="_blank" rel="noopener">Send via WhatsApp</a>`;
    result.focus();
    form.reset();
  });
}

/* ================= Misc UI ================= */
let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

function initLinks() {
  $$('[data-wa]').forEach(a => { a.href = waLink(a.dataset.wa); a.target = '_blank'; a.rel = 'noopener'; });
  $$('[data-placeholder]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); toast('Placeholder social link: add your real profile URL.');
  }));
}

/* Animated counters in the hero */
function initCounters() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count;
    if (reduce) { el.textContent = end.toLocaleString(); return; }
    const t0 = performance.now(), dur = 1400;
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/* Reveal-on-scroll */
function initReveal() {
  const items = $$('.reveal, .why li, .steps li, .testi figure, .mv article');
  items.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: .12 });
  items.forEach(el => io.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  initServices(); initNav(); initForm(); initLinks(); initCounters(); initReveal();
  $('#year').textContent = new Date().getFullYear();
});