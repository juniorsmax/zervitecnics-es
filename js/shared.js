/* ============================================================
   ZERVITECNICS BARCELONA — shared.js
   Lógica compartida: header, cookies, WhatsApp, animaciones,
   analytics, seguridad, schema.org
   ============================================================ */

'use strict';

/* ── Seguridad Anti-Clickjacking ── */
(function() {
  if (window.self !== window.top) {
    window.top.location = window.self.location;
  }
})();

/* ── Captura global de errores JS → dataLayer (visible en GA4) ──
   Throttled: máx 5 eventos por sesión para no inflar GA. */
(function initErrorTracking() {
  let count = 0;
  const MAX = 5;
  function push(kind, detail) {
    if (count++ >= MAX) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'js_error',
      error_kind: kind,
      error_msg: String(detail.msg || '').slice(0, 250),
      error_src: String(detail.src || '').slice(0, 250),
      error_line: detail.line || 0,
      error_url: location.pathname,
    });
  }
  window.addEventListener('error', (e) => {
    push('error', { msg: e.message, src: e.filename, line: e.lineno });
  });
  window.addEventListener('unhandledrejection', (e) => {
    push('promise', { msg: (e.reason && (e.reason.message || e.reason)) || 'unhandled' });
  });
})();

/* ── Constantes globales ── */
const PHONE = '625 215 983';
const PHONE_RAW = '+34625215983';
const WA_NUMBER = '34625215983';
const BUSINESS_NAME = 'Zervitecnics Barcelona';
const COOKIE_VERSION = '1.3';

/* ── IDs analytics / antibot ── */
const GTM_ID = 'GTM-P6C8L3VX';
const GA4_ID = 'G-N4C8H8KMFD';
const CLARITY_ID = 'xbowxa66oa';
const RECAPTCHA_SITE_KEY = '6LcESzAtAAAAAEhvnT0Zmh07PJUOkjYiC0qeed4S';
const EMAILJS_PUBLIC_KEY = 'PEZWRWdtVVWVZhl9R';
const EMAILJS_SERVICE_ID = 'service_tfuzhfr';
const EMAILJS_TEMPLATE_ID = 'template_wcjvjy3';
window.RECAPTCHA_SITE_KEY = RECAPTCHA_SITE_KEY;
window.EMAILJS_SERVICE_ID = EMAILJS_SERVICE_ID;
window.EMAILJS_TEMPLATE_ID = EMAILJS_TEMPLATE_ID;

/* ── reCAPTCHA v3: ejecuta y devuelve token, o '' si falla ── */
async function getRecaptchaToken(action) {
  try {
    if (typeof grecaptcha === 'undefined' || !grecaptcha.execute) return '';
    await new Promise(r => grecaptcha.ready(r));
    return await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: action || 'submit' });
  } catch (e) {
    console.warn('reCAPTCHA error', e);
    return '';
  }
}
window.getRecaptchaToken = getRecaptchaToken;

/* ── Utilidades ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Rate limit de formularios (cliente) ──
   3 capas (no a prueba de balas — defensa real va en EmailJS panel):
     1) cooldown 60s en localStorage (persistente)
     2) cooldown 30s en sessionStorage (sobrevive a borrar localStorage en misma pestaña)
     3) tope 3 envíos por sesión */
const SUBMIT_COOLDOWN_MS = 60000;
const SESSION_COOLDOWN_MS = 30000;
const MAX_SESSION_SUBMITS = 3;
function formRateLimited() {
  try {
    const now = Date.now();
    const last = parseInt(localStorage.getItem('sz_last_submit') || '0', 10);
    if (now - last < SUBMIT_COOLDOWN_MS) return true;
    const lastSession = parseInt(sessionStorage.getItem('sz_last_submit') || '0', 10);
    if (now - lastSession < SESSION_COOLDOWN_MS) return true;
    const sessionCount = parseInt(sessionStorage.getItem('sz_submit_count') || '0', 10);
    if (sessionCount >= MAX_SESSION_SUBMITS) return true;
    return false;
  } catch (e) { return false; }
}
function markFormSubmitted() {
  try {
    const now = String(Date.now());
    localStorage.setItem('sz_last_submit', now);
    sessionStorage.setItem('sz_last_submit', now);
    const c = parseInt(sessionStorage.getItem('sz_submit_count') || '0', 10) + 1;
    sessionStorage.setItem('sz_submit_count', String(c));
  } catch (e) {}
}
window.formRateLimited = formRateLimited;
window.markFormSubmitted = markFormSubmitted;

/* ── Header Scroll Effect ── */
function initHeader() {
  const header = $('.site-header');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Mobile Nav ── */
function initMobileNav() {
  const hamburger = $('.hamburger');
  const mobileNav = $('.mobile-nav');
  if (!hamburger || !mobileNav) return;
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', mobileNav.classList.contains('open'));
  });
  // Cerrar al hacer click fuera
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    }
  });
}

/* ── Scroll Animations (Intersection Observer) ── */
function initScrollAnimations() {
  const elements = $$('.fade-up, .fade-in, .slide-left, .slide-right');
  if (!elements.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  elements.forEach(el => observer.observe(el));
}

/* ── WhatsApp — mensaje contextual según página ── */
function getWAMessage() {
  const page = window.location.pathname;
  // Servicios
  if (page.includes('multisplit'))   return 'Hola, me interesa la instalación de un sistema Multisplit. ¿Pueden darme un presupuesto?';
  if (page.includes('split'))        return 'Hola, me interesa la instalación de un Split 1×1 en Barcelona. ¿Pueden darme un presupuesto?';
  if (page.includes('conductos'))    return 'Hola, me interesa el aire acondicionado por conductos. ¿Pueden darme información y presupuesto?';
  if (page.includes('subvenciones')) return 'Hola, me gustaría información sobre las subvenciones disponibles para instalar aire acondicionado.';
  if (page.includes('precios'))      return 'Hola, he visto vuestros precios y me gustaría solicitar un presupuesto personalizado.';
  // Marcas
  if (page.includes('daikin'))       return 'Hola, me interesa instalar un equipo Daikin en Barcelona. ¿Pueden darme un presupuesto?';
  if (page.includes('mitsubishi'))   return 'Hola, me interesa instalar un equipo Mitsubishi Electric en Barcelona. ¿Pueden darme un presupuesto?';
  if (page.includes('fujitsu'))      return 'Hola, me interesa instalar un equipo Fujitsu en Barcelona. ¿Pueden darme un presupuesto?';
  if (page.includes('samsung'))      return 'Hola, me interesa instalar un equipo Samsung en Barcelona. ¿Pueden darme un presupuesto?';
  if (page.includes('lg'))           return 'Hola, me interesa instalar un equipo LG en Barcelona. ¿Pueden darme un presupuesto?';
  if (page.includes('hisense'))      return 'Hola, me interesa instalar un equipo Hisense en Barcelona. ¿Pueden darme un presupuesto?';
  if (page.includes('panasonic'))    return 'Hola, me interesa instalar un equipo Panasonic en Barcelona. ¿Pueden darme un presupuesto?';
  if (page.includes('toshiba'))      return 'Hola, me interesa instalar un equipo Toshiba en Barcelona. ¿Pueden darme un presupuesto?';
  if (page.includes('haier'))        return 'Hola, me interesa instalar un equipo Haier en Barcelona. ¿Pueden darme un presupuesto?';
  if (page.includes('midea'))        return 'Hola, me interesa instalar un equipo Midea en Barcelona. ¿Pueden darme un presupuesto?';
  if (page.includes('dicore'))       return 'Hola, me interesa instalar un equipo Dicore en Barcelona. ¿Pueden darme un presupuesto?';
  if (page.includes('marca-blanca')) return 'Hola, me interesa información sobre aire acondicionado marca blanca. ¿Pueden darme un presupuesto?';
  // Zonas
  if (page.includes('hospitalet'))   return "Hola, me gustaría un presupuesto para instalar aire acondicionado en L'Hospitalet de Llobregat.";
  if (page.includes('badalona'))     return 'Hola, me gustaría un presupuesto para instalar aire acondicionado en Badalona.';
  if (page.includes('sant-cugat'))   return 'Hola, me gustaría un presupuesto para instalar aire acondicionado en Sant Cugat del Vallès.';
  if (page.includes('cornella'))     return 'Hola, me gustaría un presupuesto para instalar aire acondicionado en Cornellà de Llobregat.';
  if (page.includes('terrassa'))     return 'Hola, me gustaría un presupuesto para instalar aire acondicionado en Terrassa.';
  if (page.includes('sabadell'))     return 'Hola, me gustaría un presupuesto para instalar aire acondicionado en Sabadell.';
  if (page.includes('eixample'))     return 'Hola, me gustaría un presupuesto para instalar aire acondicionado en el Eixample de Barcelona.';
  if (page.includes('gracia'))       return 'Hola, me gustaría un presupuesto para instalar aire acondicionado en el barrio de Gràcia, Barcelona.';
  // Default
  return 'Hola, estoy interesado en instalar aire acondicionado en Barcelona. ¿Pueden darme más información?';
}

function initWhatsApp() {
  const page = window.location.pathname;
  const msg = getWAMessage();
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  // Actualiza TODOS los links de WhatsApp de la página
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.href = waUrl;
    link.addEventListener('click', () => trackEvent('whatsapp_click', { page }));
  });
}

/* ── FAQ Accordion ── */
function initFAQ() {
  const items = $$('.faq-item');
  items.forEach(item => {
    const question = $('.faq-question', item);
    if (!question) return;
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ── Reviews Carousel ── */
function initCarousel() {
  const wrapper = $('.carousel-wrapper');
  if (!wrapper) return;
  const track = $('.carousel-track', wrapper);
  const dots = $$('.carousel-dot');
  if (!track) return;

  const cards = $$('.review-card', track);
  let current = 0;
  let autoplay;
  let isPlaying = true;
  let touchStartX = 0;

  function getVisible() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  }

  function getMax() {
    return Math.max(0, cards.length - getVisible());
  }

  function goTo(idx) {
    const max = getMax();
    current = Math.max(0, Math.min(idx, max));
    const cardWidth = cards[0] ? cards[0].offsetWidth + 20 : 0;
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function next() { goTo(current >= getMax() ? 0 : current + 1); }
  function prev() { goTo(current <= 0 ? getMax() : current - 1); }

  function startAutoplay() {
    stopAutoplay();
    autoplay = setInterval(next, 4000);
    isPlaying = true;
  }
  function stopAutoplay() {
    clearInterval(autoplay);
    isPlaying = false;
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); stopAutoplay(); });
  });

  wrapper.addEventListener('mouseenter', stopAutoplay);
  wrapper.addEventListener('mouseleave', startAutoplay);
  wrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    stopAutoplay();
  }, { passive: true });
  wrapper.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    startAutoplay();
  });

  window.addEventListener('resize', () => goTo(current));
  goTo(0);
  startAutoplay();
}

/* ── Cookie Banner RGPD ── */
function initCookies() {
  const banner = $('.cookie-banner');
  if (!banner) return;

  const saved = localStorage.getItem('sz_consent');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.version === COOKIE_VERSION) {
        applyConsent(data);
        return;
      }
    } catch(e) {}
  }

  setTimeout(() => banner.classList.add('visible'), 1200);

  const btnAccept = $('.btn-cookie-accept', banner);
  const btnNecessary = $('.btn-cookie-necessary', banner);
  const btnConfig = $('.btn-cookie-config', banner);

  btnAccept?.addEventListener('click', () => {
    saveConsent({ analytics: true, marketing: true, version: COOKIE_VERSION, ts: Date.now() });
    hideBanner();
  });
  btnNecessary?.addEventListener('click', () => {
    saveConsent({ analytics: false, marketing: false, version: COOKIE_VERSION, ts: Date.now() });
    hideBanner();
  });
  btnConfig?.addEventListener('click', () => {
    window.location.href = (window.location.pathname.includes('/pages/') ? '' : 'pages/') + 'cookies.html';
  });

  function hideBanner() { banner.classList.remove('visible'); }
}

function saveConsent(data) {
  localStorage.setItem('sz_consent', JSON.stringify(data));
  applyConsent(data);
}

function applyConsent(data) {
  window.szConsent = data;
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  if (data.analytics) {
    gtag('consent', 'update', {
      'analytics_storage': 'granted',
      'ad_storage': 'granted'
    });
    loadClarity();
  }
}

/* ── Microsoft Clarity (carga tras consent) ── */
function loadClarity() {
  if (window.clarityLoaded || !CLARITY_ID) return;
  window.clarityLoaded = true;
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window,document,'clarity','script',CLARITY_ID);
}

/* ── Analytics Tracking ── */
function trackEvent(name, params = {}) {
  if (!window.dataLayer) return;
  window.dataLayer.push({ event: name, ...params });
}

function initTracking() {
  // Clics teléfono
  $$('a[href^="tel:"]').forEach(el => {
    el.addEventListener('click', () => trackEvent('phone_click', { location: el.dataset.location || 'unknown' }));
  });
  // Scroll depth
  const depths = [25, 50, 75, 90];
  const tracked = new Set();
  window.addEventListener('scroll', () => {
    const pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    depths.forEach(d => {
      if (pct >= d && !tracked.has(d)) {
        tracked.add(d);
        trackEvent('scroll_depth', { depth: d });
      }
    });
  }, { passive: true });
}

/* ── Price Tabs ── */
function initPriceTabs() {
  const tabs = $$('.price-tab');
  const panels = $$('.price-panel');
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.panel);
      if (target) {
        target.classList.add('active');
        trackEvent('price_view', { tab: tab.dataset.panel });
      }
    });
  });
}

/* ── Formulario 2 pasos ── */
function initForm() {
  const form = $('#budget-form');
  if (!form) return;
  const step1 = $('#form-step-1', form);
  const step2 = $('#form-step-2', form);
  const btnNext = $('#btn-next', form);
  const btnBack = $('#btn-back', form);
  const dot1 = $('#dot-1');
  const dot2 = $('#dot-2');

  let formStarted = false;
  const formLoadedAt = Date.now();

  function validateStep1() {
    let ok = true;
    ['f-nombre', 'f-telefono', 'f-zona'].forEach(id => {
      const el = document.getElementById(id);
      const err = document.getElementById(id + '-err');
      if (!el) return;
      const val = el.value.trim();
      let msg = '';
      if (!val) msg = 'Este campo es obligatorio.';
      else if (id === 'f-telefono' && !/^[6-9]\d{8}$/.test(val.replace(/\s/g,''))) msg = 'Introduce un teléfono válido.';
      if (msg) { el.classList.add('error'); if(err){ err.textContent = msg; err.classList.add('visible'); } ok = false; }
      else { el.classList.remove('error'); if(err) err.classList.remove('visible'); }
    });
    return ok;
  }

  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('focus', () => {
      if (!formStarted) { formStarted = true; trackEvent('form_start'); }
    });
    el.addEventListener('input', () => {
      el.classList.remove('error');
      const err = document.getElementById(el.id + '-err');
      if (err) err.classList.remove('visible');
    });
  });

  btnNext?.addEventListener('click', () => {
    if (!validateStep1()) return;
    step1.style.display = 'none';
    step2.style.display = 'block';
    dot1.classList.remove('active'); dot1.classList.add('done');
    dot2.classList.add('active');
  });

  btnBack?.addEventListener('click', () => {
    step2.style.display = 'none';
    step1.style.display = 'block';
    dot2.classList.remove('active');
    dot1.classList.remove('done'); dot1.classList.add('active');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Anti-spam: honeypot relleno o envío en menos de 3s = bot
    if (document.getElementById('f-website')?.value) return;
    if (Date.now() - formLoadedAt < 3000) return;

    const rgpd = document.getElementById('f-rgpd');
    const rgpdErr = document.getElementById('f-rgpd-err');
    if (rgpd && !rgpd.checked) {
      if (rgpdErr) {
        rgpdErr.textContent = 'Debes aceptar la política de privacidad.';
        rgpdErr.classList.add('visible');
      }
      return;
    }
    if (rgpdErr) rgpdErr.classList.remove('visible');

    // Rate limit: 1 envío por minuto (protege la cuota de EmailJS)
    if (formRateLimited()) {
      alert('Ya hemos recibido tu solicitud hace un momento. Te contactaremos pronto. Si es urgente, llámanos al ' + PHONE);
      return;
    }

    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    const data = {
      nombre: document.getElementById('f-nombre')?.value || '',
      telefono: document.getElementById('f-telefono')?.value || '',
      zona: document.getElementById('f-zona')?.value || '',
      tipo: document.getElementById('f-tipo')?.value || '',
      observaciones: document.getElementById('f-obs')?.value || '',
    };

    try {
      const token = await getRecaptchaToken('hero_form');
      data['g-recaptcha-response'] = token;
      if (typeof emailjs !== 'undefined') {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, data);
      }
      markFormSubmitted();
      trackEvent('form_submit', { zona: data.zona, tipo: data.tipo });
      window.location.href = 'gracias.html';
    } catch(err) {
      console.error('EmailJS error:', err);
      trackEvent('form_error', { source: 'hero-form', message: (err && err.text) || String(err) });
      btn.disabled = false;
      btn.textContent = 'Solicitar presupuesto';
      alert('Error al enviar. Por favor llámenos al ' + PHONE);
    }
  });
}

/* ── Emails ofuscados (anti-scraping) ── */
function deobfuscateEmails() {
  document.querySelectorAll('a[data-eu][data-ed]').forEach(a => {
    const addr = a.dataset.eu + '@' + a.dataset.ed;
    a.href = 'mailto:' + addr;
    a.textContent = addr;
  });
}

/* ── Protección de imágenes ── */
function protectImages() {
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });
}

/* ── Schema.org LocalBusiness ── */
function injectLocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HVACBusiness"],
    "name": "Zervitecnics Barcelona",
    "alternateName": "Aires Zervitecnics",
    "description": "Empresa especializada en instalación de aire acondicionado en Barcelona. Técnico HVAC certificado con carnet de gases fluorados y habilitación RITE.",
    "url": "https://juniorsmax.github.io/zervitecnics-web/",
    "telephone": PHONE_RAW,
    "email": "formularios.zervitecnics@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Barcelona",
      "addressLocality": "Barcelona",
      "addressRegion": "Cataluña",
      "postalCode": "08001",
      "addressCountry": "ES"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 41.3851,
      "longitude": 2.1734
    },
    "areaServed": [
      "Barcelona", "L'Eixample", "Gràcia", "L'Hospitalet de Llobregat",
      "Badalona", "Sant Cugat del Vallès", "Cornellà de Llobregat",
      "Terrassa", "Sabadell"
    ],
    "openingHoursSpecification": [
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "08:00", "closes": "20:00" },
      { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "14:00" }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "127",
      "bestRating": "5"
    },
    "hasCredential": [
      "Carnet Gases Fluorados",
      "Habilitación RITE",
      "Instalador HVAC Certificado"
    ],
    "priceRange": "€€",
    "currenciesAccepted": "EUR",
    "paymentAccepted": "Cash, Credit Card, Bank Transfer",
    "image": "https://juniorsmax.github.io/zervitecnics-web/img/logo_zervitecnics.png",
    "logo": "https://juniorsmax.github.io/zervitecnics-web/img/logo_zervitecnics.png",
    "sameAs": [
      "https://www.instagram.com/zervitecnics",
      "https://www.facebook.com/zervitecnics"
    ]
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/* ── Schema BreadcrumbList ── */
function injectBreadcrumbSchema(items) {
  if (!items || !items.length) return;
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": item.url
    }))
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/* ── Schema FAQPage ── */
function injectFAQSchema() {
  const items = $$('.faq-item');
  if (!items.length) return;
  const faqs = items.map(item => ({
    "@type": "Question",
    "name": $('.faq-question', item)?.textContent?.trim() || '',
    "acceptedAnswer": {
      "@type": "Answer",
      "text": $('.faq-answer-inner', item)?.textContent?.trim() || ''
    }
  })).filter(f => f.name);
  if (!faqs.length) return;
  const schema = { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faqs };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/* ── Geolocalización por URL ── */
function detectZoneFromURL() {
  const zones = {
    'eixample': { name: "L'Eixample", transport: 0, time: '30 min' },
    'gracia': { name: 'Gràcia', transport: 0, time: '35 min' },
    'hospitalet': { name: "L'Hospitalet de Llobregat", transport: 15, time: '40 min' },
    'badalona': { name: 'Badalona', transport: 20, time: '45 min' },
    'sant-cugat': { name: 'Sant Cugat del Vallès', transport: 25, time: '50 min' },
    'cornella': { name: 'Cornellà de Llobregat', transport: 20, time: '40 min' },
    'terrassa': { name: 'Terrassa', transport: 35, time: '55 min' },
    'sabadell': { name: 'Sabadell', transport: 30, time: '50 min' },
    'sarria': { name: 'Sarrià-Sant Gervasi', transport: 0, time: '35 min' },
    'sants': { name: 'Sants-Montjuïc', transport: 0, time: '30 min' },
    'les-corts': { name: 'Les Corts', transport: 0, time: '30 min' },
    'castelldefels': { name: 'Castelldefels', transport: 30, time: '45 min' },
    'nou-barris': { name: 'Nou Barris', transport: 0, time: '35 min' },
    'sant-andreu': { name: 'Sant Andreu', transport: 0, time: '35 min' },
    'sant-marti': { name: 'Sant Martí', transport: 0, time: '30 min' }
  };
  const path = window.location.pathname;
  for (const [key, data] of Object.entries(zones)) {
    if (path.includes(key)) {
      $$('.zone-name-dynamic').forEach(el => el.textContent = data.name);
      $$('.zone-transport-cost').forEach(el => el.textContent = data.transport > 0 ? `${data.transport}€` : 'Sin coste adicional');
      $$('.zone-travel-time').forEach(el => el.textContent = data.time);
      return data;
    }
  }
  return null;
}

/* ── Números animados ── */
function animateCounters() {
  const counters = $$('[data-count]');
  if (!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const duration = 1800;
      const start = performance.now();
      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initScrollAnimations();
  initWhatsApp();
  initFAQ();
  initCarousel();
  initCookies();
  initTracking();
  initPriceTabs();
  initForm();
  deobfuscateEmails();
  protectImages();
  injectLocalBusinessSchema();
  injectFAQSchema();
  animateCounters();
  detectZoneFromURL();

  // EmailJS init
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  renderDynPrices();
});

/* ════════════════════════════════════════════════
   PRECIOS DINÁMICOS — Anti-scraping
   Modificar aquí para cambiar precios en toda la web
   NUNCA poner precios en el HTML
════════════════════════════════════════════════ */
const PRECIOS_WEB = {
  'mo-basico':    { label: 'Desde 299 €',   valor: 299  },
  'mo-estandar':  { label: 'Desde 350 €',   valor: 350  },
  'pack-eco':     { label: 'Desde 799 €',   valor: 799  },
  'pack-medio':   { label: 'Desde 1.299 €', valor: 1299 },
  'pack-premium': { label: 'Desde 1.699 €', valor: 1699 },
  'multi-2x1':    { label: 'Desde 1.799 €', valor: 1799 },
  'multi-3x1':    { label: 'Desde 2.599 €', valor: 2599 },
};

function renderDynPrices() {
  document.querySelectorAll('[data-price]').forEach(el => {
    const key = el.dataset.price;
    if (PRECIOS_WEB[key]) {
      el.textContent = PRECIOS_WEB[key].label;
      el.style.fontWeight = '700';
      el.style.color = 'var(--green, #00C896)';
    }
  });
}

