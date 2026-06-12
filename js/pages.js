/* ============================================================
   ZERVITECNICS BARCELONA — pages.js
   Lógica subpáginas: precios dinámicos, schema Service,
   geolocalización, cookies reset
   ============================================================ */

'use strict';

/* ── PRECIOS DINÁMICOS (nunca en HTML) ── */
const PRECIOS = {
  pack: [
    {
      name: 'Split 1×1 · 2,5 kW',
      desc: 'Ideal para habitaciones de hasta 20 m²',
      from: 'Precio desde',
      price: 1099,
      featured: false,
      badge: null,
      features: [
        'Equipo inverter A++',
        'Instalación completa',
        'Informe técnico de instalación',
        'Garantía 3 años fabricante',
        'Garantía 3 años instalación',
        'Soporte post-instalación'
      ]
    },
    {
      name: 'Split 1×1 · 3,5 kW',
      desc: 'Perfecto para salones de 20–35 m²',
      from: 'El más popular',
      price: 1299,
      featured: true,
      badge: 'Más vendido',
      features: [
        'Equipo inverter A+++',
        'Instalación completa',
        'Informe técnico de instalación',
        'Garantía 3 años fabricante',
        'Garantía 3 años instalación',
        'Soporte prioritario 24h'
      ]
    },
    {
      name: 'Split 1×1 · 5 kW',
      desc: 'Para espacios grandes de 35–60 m²',
      from: 'Precio desde',
      price: 1549,
      featured: false,
      badge: null,
      features: [
        'Equipo inverter A++',
        'Instalación completa',
        'Informe técnico de instalación',
        'Garantía 3 años fabricante',
        'Garantía 3 años instalación',
        'Soporte post-instalación'
      ]
    }
  ],
  instalacion: [
    {
      name: 'Solo instalación · Básica',
      desc: 'Tienes el equipo, nosotros lo instalamos',
      from: 'Precio desde',
      price: 299,
      featured: false,
      badge: null,
      features: [
        'Instalación del equipo',
        'Carga de gas refrigerante',
        'Prueba de funcionamiento',
        'Informe técnico de instalación',
        'Garantía 3 años instalación'
      ]
    },
    {
      name: 'Solo instalación · Completa',
      desc: 'Instalación completa con acabado cuidado',
      from: 'Más recomendado',
      price: 399,
      featured: true,
      badge: 'Recomendado',
      features: [
        'Todo lo de la básica',
        'Limpieza de zona de trabajo',
        'Informe técnico detallado',
        'Garantía 3 años instalación',
        'Soporte post-instalación'
      ]
    },
    {
      name: 'Solo instalación · Premium',
      desc: 'Instalación con acabado y estética premium',
      from: 'Precio desde',
      price: 499,
      featured: false,
      badge: null,
      features: [
        'Todo lo de la completa',
        'Canaleta decorativa blanca',
        'Acabado premium cuidado',
        'Garantía 3 años instalación',
        'Soporte prioritario'
      ]
    }
  ],
  multisplit: [
    {
      name: 'Multisplit 2×1',
      desc: '1 unidad exterior + 2 interiores',
      from: 'Precio desde',
      price: 2199,
      featured: false,
      badge: null,
      features: [
        '2 habitaciones climatizadas',
        'Instalación completa',
        'Informe técnico de instalación',
        'Garantía 3 años fabricante',
        'Garantía 3 años instalación',
        'Control independiente por zona'
      ]
    },
    {
      name: 'Multisplit 3×1',
      desc: '1 unidad exterior + 3 interiores',
      from: 'Más popular',
      price: 2899,
      featured: true,
      badge: 'Más popular',
      features: [
        '3 habitaciones climatizadas',
        'Instalación completa',
        'Informe técnico de instalación',
        'Garantía 3 años fabricante',
        'Garantía 3 años instalación',
        'Control independiente por zona'
      ]
    },
    {
      name: 'Multisplit 4×1',
      desc: '1 unidad exterior + 4 interiores',
      from: 'Precio desde',
      price: 3599,
      featured: false,
      badge: null,
      features: [
        '4 habitaciones climatizadas',
        'Instalación completa',
        'Informe técnico de instalación',
        'Garantía 3 años fabricante',
        'Garantía 3 años instalación',
        'Control independiente por zona'
      ]
    }
  ]
};

function renderPrices() {
  Object.entries(PRECIOS).forEach(([tab, cards]) => {
    const panel = document.getElementById('panel-' + tab);
    if (!panel) return;
    panel.innerHTML = cards.map(card => `
      <div class="price-card${card.featured ? ' featured' : ''}">
        ${card.badge ? `<div class="price-badge">${card.badge}</div>` : ''}
        <div class="price-name">${card.name}</div>
        <div class="price-desc">${card.desc}</div>
        <div class="price-amount"><sup>€</sup>${card.price.toLocaleString('es-ES')}</div>
        <div class="price-from">${card.from} · IVA incluido</div>
        <ul class="price-features">
          ${card.features.map(f => `
            <li class="price-feature">
              <svg viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
              ${f}
            </li>`).join('')}
        </ul>
        <a href="#presupuesto" class="btn btn-primary w-full" onclick="trackEvent('price_cta_click',{plan:'${card.name}'})">
          Solicitar presupuesto
        </a>
      </div>
    `).join('');
  });
}

/* ── Schema Service ── */
function injectServiceSchema(serviceName, description, price) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": serviceName,
    "description": description,
    "provider": {
      "@type": "LocalBusiness",
      "name": "Zervitecnics Barcelona",
      "telephone": "+34693123456",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Barcelona",
        "addressRegion": "Cataluña",
        "addressCountry": "ES"
      }
    },
    "areaServed": {
      "@type": "City",
      "name": "Barcelona"
    },
    "offers": price ? {
      "@type": "Offer",
      "price": price,
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock"
    } : undefined
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/* ── Cookie Reset (página cookies.html) ── */
function initCookieReset() {
  const btn = document.getElementById('btn-reset-cookies');
  if (!btn) return;
  btn.addEventListener('click', () => {
    localStorage.removeItem('sz_consent');
    window.location.reload();
  });
  // Mostrar estado actual
  const statusEl = document.getElementById('cookie-status');
  if (statusEl) {
    const saved = localStorage.getItem('sz_consent');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        statusEl.textContent = `Preferencias guardadas el ${new Date(data.ts).toLocaleDateString('es-ES')}. Analytics: ${data.analytics ? 'Activado' : 'Desactivado'}.`;
      } catch(e) { statusEl.textContent = 'Sin preferencias guardadas.'; }
    } else {
      statusEl.textContent = 'Sin preferencias guardadas.';
    }
  }
}

/* ── Cálculo de materiales (Multisplit y Conductos) ── */
function toggleMaterialFields(tipo) {
  const msFields = document.getElementById('fields-multisplit');
  const cdFields = document.getElementById('fields-conductos');
  if (msFields) msFields.style.display = tipo && tipo.startsWith('multisplit') ? 'block' : 'none';
  if (cdFields) cdFields.style.display = tipo === 'conductos' ? 'block' : 'none';
  // Resetear resultados
  const msRes = document.getElementById('calc-multisplit-result');
  const cdRes = document.getElementById('calc-conductos-result');
  if (msRes) msRes.style.display = 'none';
  if (cdRes) cdRes.style.display = 'none';
}

function calcMultisplit() {
  const tipoEl = document.getElementById('f-tipo');
  const distEl = document.getElementById('f-dist-ext');
  const plantaEl = document.getElementById('f-planta');
  if (!tipoEl || !distEl) return;
  const tipo = tipoEl.value;
  const dist = parseFloat(distEl.value) || 5;
  const planta = parseInt(plantaEl ? plantaEl.value : 1) || 1;
  const unidades = tipo === 'multisplit-2x1' ? 2 : tipo === 'multisplit-3x1' ? 3 : tipo === 'multisplit-4x1' ? 4 : 0;
  if (unidades === 0) return;

  // Cálculo: tubería = distancia por unidad + 1.5m por planta de bajada
  const tubPorUnidad = dist + (planta * 1.5);
  const tubTotal = Math.ceil(tubPorUnidad * unidades * 1.1); // +10% margen
  const cableTotal = Math.ceil(tubTotal * 1.15); // cable siempre algo más

  const resEl = document.getElementById('calc-multisplit-result');
  if (!resEl) return;
  document.getElementById('calc-ms-tuberia').textContent = `📦 Tubería frigorífica estimada: ${tubTotal} metros`;
  document.getElementById('calc-ms-cable').textContent = `⚡ Cable eléctrico estimado: ${cableTotal} metros`;
  document.getElementById('calc-ms-nota').textContent = `ℹ️ Estimación orientativa para ${unidades} unidades interiores a ${dist}m de la exterior. El técnico confirmará la medición exacta en visita.`;
  resEl.style.display = 'block';
}

function calcConductos() {
  const m2El = document.getElementById('f-m2');
  const estEl = document.getElementById('f-estancias');
  if (!m2El) return;
  const m2 = parseFloat(m2El.value) || 80;
  const estancias = parseInt(estEl ? estEl.value : 4) || 4;

  // Cálculo: conducto principal + ramales por estancia
  const conductoPrincipal = Math.ceil(Math.sqrt(m2) * 1.5);
  const ramales = estancias * 3; // ~3m por ramal
  const conductosTotal = Math.ceil((conductoPrincipal + ramales) * 1.1);
  const cableTotal = Math.ceil(conductosTotal * 0.8 + 10);
  const tuberiaTotal = Math.ceil(conductosTotal * 0.4 + 5); // tubería frigorífica

  const resEl = document.getElementById('calc-conductos-result');
  if (!resEl) return;
  document.getElementById('calc-cd-conducto').textContent = `🌀 Metros de conducto estimados: ${conductosTotal} metros`;
  document.getElementById('calc-cd-cable').textContent = `⚡ Cable eléctrico estimado: ${cableTotal} metros`;
  document.getElementById('calc-cd-tuberia').textContent = `📦 Tubería frigorífica estimada: ${tuberiaTotal} metros`;
  document.getElementById('calc-cd-nota').textContent = `ℹ️ Estimación para ${m2}m² con ${estancias} bocas. El técnico confirmará las medidas exactas en visita previa gratuita.`;
  resEl.style.display = 'block';
}

// Activar cálculo automático al cambiar valores
document.addEventListener('DOMContentLoaded', () => {
  // ── Cálculo automático multisplit y conductos ──
  ['f-dist-ext', 'f-planta', 'f-tipo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => {
      const tipo = document.getElementById('f-tipo');
      if (tipo && tipo.value.startsWith('multisplit')) calcMultisplit();
    });
  });
  ['f-m2', 'f-estancias'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calcConductos);
  })

  // ── Init páginas ──
  renderPrices();
  initCookieReset();

  // Detectar página actual e inyectar schema Service
  const path = window.location.pathname;
  if (path.includes('multisplit')) {
    injectServiceSchema('Instalación Multisplit Barcelona', 'Instalación de sistemas multisplit en Barcelona. Climatiza varias habitaciones con una sola unidad exterior.', 399);
  } else if (path.includes('split')) {
    injectServiceSchema('Instalación Split 1x1 Barcelona', 'Instalación profesional de aire acondicionado split 1x1 en Barcelona. Técnico certificado.', 299);
  } else if (path.includes('conductos')) {
    injectServiceSchema('Aire Acondicionado por Conductos Barcelona', 'Instalación de aire acondicionado por conductos en Barcelona. Climatización invisible y silenciosa.', 990);
  }
});
