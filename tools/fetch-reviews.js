#!/usr/bin/env node
/*
 * fetch-reviews.js — Descarga reseñas desde Places API (New) Place Details
 * y las persiste en data/reviews.json para ser renderizadas en build.
 *
 * Uso:
 *   GOOGLE_PLACES_API_KEY=... node tools/fetch-reviews.js
 *
 * Configuración: config/reviews.json
 *   - PLACE_ID       (string, requerido)   ID de ficha de Google (places/XXXX o solo XXXX)
 *   - REVIEW_URL     (string)              Enlace "Deja una reseña" (una sola fuente de verdad)
 *   - LANGUAGE       (string, por defecto es)
 *   - MIN_RATING     (number, por defecto 4)   descarta reseñas con menos estrellas
 *   - MAX_REVIEWS    (number, por defecto 6)   top N por fecha (más recientes primero)
 *
 * NO se ejecuta en local sin clave: aborta con exit 0 si no hay PLACE_ID
 * para que el workflow pueda correr aunque la ficha no esté lista.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(REPO, 'config', 'reviews.json');
const OUT_PATH = path.join(REPO, 'data', 'reviews.json');

function readConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`[fetch-reviews] falta ${CONFIG_PATH}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
  const cfg = JSON.parse(raw);
  cfg.LANGUAGE   = cfg.LANGUAGE   || 'es';
  cfg.MIN_RATING = typeof cfg.MIN_RATING === 'number' ? cfg.MIN_RATING : 4;
  cfg.MAX_REVIEWS = typeof cfg.MAX_REVIEWS === 'number' ? cfg.MAX_REVIEWS : 6;
  return cfg;
}

function normalizePlaceId(placeId) {
  if (!placeId) return '';
  return placeId.startsWith('places/') ? placeId : `places/${placeId}`;
}

async function fetchPlaceDetails(apiKey, placeResource, language) {
  const url = `https://places.googleapis.com/v1/${placeResource}?languageCode=${encodeURIComponent(language)}`;
  const fieldMask = [
    'id',
    'displayName',
    'rating',
    'userRatingCount',
    'googleMapsUri',
    'reviews.rating',
    'reviews.text',
    'reviews.originalText',
    'reviews.authorAttribution',
    'reviews.publishTime',
    'reviews.relativePublishTimeDescription'
  ].join(',');

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fieldMask
    }
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Places API ${res.status}: ${body.slice(0, 500)}`);
  }
  return res.json();
}

function pickText(review) {
  const t = review.text?.text || review.originalText?.text || '';
  return (t || '').trim();
}

function trimAuthor(review) {
  const a = review.authorAttribution || {};
  return {
    name: (a.displayName || 'Cliente de Google').trim(),
    photo: a.photoUri || null
  };
}

async function main() {
  const cfg = readConfig();

  if (!cfg.PLACE_ID) {
    console.log('[fetch-reviews] PLACE_ID vacío en config/reviews.json — nada que hacer.');
    process.exit(0);
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error('[fetch-reviews] falta GOOGLE_PLACES_API_KEY en el entorno.');
    process.exit(1);
  }

  const placeResource = normalizePlaceId(cfg.PLACE_ID);
  console.log(`[fetch-reviews] consultando ${placeResource} (idioma=${cfg.LANGUAGE})`);

  const data = await fetchPlaceDetails(apiKey, placeResource, cfg.LANGUAGE);

  const allReviews = Array.isArray(data.reviews) ? data.reviews : [];
  const filtered = allReviews
    .filter(r => (r.rating || 0) >= cfg.MIN_RATING && pickText(r))
    .sort((a, b) => new Date(b.publishTime || 0) - new Date(a.publishTime || 0))
    .slice(0, cfg.MAX_REVIEWS)
    .map(r => ({
      rating: r.rating,
      text: pickText(r),
      author: trimAuthor(r),
      publishTime: r.publishTime || null,
      relative: r.relativePublishTimeDescription || null
    }));

  const out = {
    source: 'google-places',
    fetchedAt: new Date().toISOString(),
    place: {
      id: data.id || cfg.PLACE_ID,
      displayName: data.displayName?.text || null,
      rating: data.rating || null,
      userRatingCount: data.userRatingCount || null,
      googleMapsUri: data.googleMapsUri || null
    },
    reviews: filtered,
    reviewUrl: cfg.REVIEW_URL || null
  };

  if (!fs.existsSync(path.dirname(OUT_PATH))) {
    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  }
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`[fetch-reviews] guardadas ${filtered.length} reseñas → ${path.relative(REPO, OUT_PATH)}`);
}

main().catch(err => {
  console.error('[fetch-reviews] error:', err.message);
  process.exit(1);
});
