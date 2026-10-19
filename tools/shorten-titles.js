#!/usr/bin/env node
/* Acorta los <title> de más de 65 caracteres de las páginas indexables (Google corta
   hacia los 60-65). Reglas por tipo de página, siempre conservando la keyword principal;
   og:title y twitter:title se actualizan si eran iguales al título.
   El hub (aires-acondicionados/index.html) no se toca: está en posición 2-3.

   Se puede volver a ejecutar (solo actúa sobre títulos > 65).
   Uso: node tools/shorten-titles.js [--dry] */

const fs = require('fs');
const path = require('path');
const { collectHtmlFiles, relPath } = require('./lib/site-pages');

const MAX = 65;
const DRY = process.argv.includes('--dry');
const decode = s => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const encode = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const fits = t => t.length <= MAX;

// Títulos escritos a mano para páginas únicas.
const MANUAL = {
  'aires-acondicionados/ofertas.html': 'Ofertas aire acondicionado Barcelona: desde 680 € + IVA',
  'aires-acondicionados/instalacion-personalizada.html': 'Instalación personalizada de aire acondicionado en Barcelona',
  'aires-acondicionados/mantenimiento.html': 'Mantenimiento aire acondicionado Barcelona: 70 € + IVA',
  'aires-acondicionados/subvenciones.html': 'Subvenciones aire acondicionado Barcelona 2026 | Hasta 60%',
  'aires-acondicionados/precios.html': 'Precios instalación aire acondicionado Barcelona 2026',
  'aires-acondicionados/guias/normativa-comunidad-vecinos-barcelona.html': 'Normativa aire acondicionado: comunidad de vecinos y fachadas',
  'aires-acondicionados/guias/subvenciones-como-solicitarlas.html': 'Subvenciones aire acondicionado 2026: cómo solicitarlas',
  'aires-acondicionados/guias/ubicacion-unidad-exterior.html': 'Dónde colocar la unidad exterior del aire acondicionado',
  'aires-acondicionados/guias/que-frigorias-necesito.html': '¿Qué frigorías necesito? Tabla m² a kW para aire acondicionado',
  'aires-acondicionados/guias/gas-r32-vs-r410a.html': 'Gas R32 vs R410A: diferencias, eficiencia y qué equipo elegir',
  'aires-acondicionados/guias/split-vs-multisplit-vs-conductos.html': 'Split, multisplit o conductos: comparativa técnica y precios',
  'aires-acondicionados/guias/consumo-real-aire-acondicionado.html': 'Consumo real del aire acondicionado: cuánto gasta al mes',
  'aires-acondicionados/marcas/mitsubishi-sant-quirze-del-valles.html': 'Mitsubishi Electric en Sant Quirze del Vallès | Instalación',
  'aires-acondicionados/guias/mantenimiento-yo-mismo-o-profesional.html': 'Mantenimiento del aire acondicionado: ¿yo mismo o un profesional?',
};

// Reglas por patrón: cada una devuelve candidatos; se usa el primero que cabe.
const RULES = [
  [/^Instalar aire acondicionado (\d+) frigorías en (.+) \| Precio$/, m => [
    `Aire acondicionado ${m[1]} frigorías en ${m[2]} | Precio`,
    `${m[1]} frigorías en ${m[2]}: instalación y precio`,
    `${m[1]} frigorías en ${m[2]}: precio`]],
  [/^Instalación de Aire Acondicionado en (.+) \| Empresa Instaladora$/, m => [
    `Instalación de aire acondicionado en ${m[1]}`]],
  [/^Mantenimiento Aire Acondicionado (.+) — preventivo 70 € \+ IVA \| Zervitecnics$/, m => [
    `Mantenimiento aire acondicionado ${m[1]} | 70 € + IVA`,
    `Mantenimiento aire acondicionado ${m[1]}`]],
  [/^Mantenimiento (.+) Barcelona — preventivo 70 € \+ IVA \| Zervitecnics$/, m => [
    `Mantenimiento ${m[1]} en Barcelona | preventivo 70 € + IVA`,
    `Mantenimiento ${m[1]} en Barcelona | 70 € + IVA`]],
  [/^(.+) \| Zervitecnics$/, m => [m[1]]],
  [/^(.+) \| Técnico Especializado$/, m => [m[1]]],
];

const SKIP = new Set(['aires-acondicionados/index.html']);
let changed = 0; const pending = [];
for (const file of collectHtmlFiles()) {
  const rel = relPath(file);
  if (SKIP.has(rel) || !rel.startsWith('aires-acondicionados/')) continue;
  let html = fs.readFileSync(file, 'utf8');
  if (/<meta name="robots"[^>]*noindex/i.test(html)) continue;
  const m = html.match(/<title>([^<]*)<\/title>/);
  if (!m) continue;
  const old = decode(m[1].trim());
  if (fits(old)) continue;
  let next = MANUAL[rel];
  if (!next) {
    let cur = old;
    for (let i = 0; i < 3 && !fits(cur); i++) {
      const rule = RULES.find(([re]) => re.test(cur));
      if (!rule) break;
      const cands = rule[1](cur.match(rule[0]));
      cur = cands.find(fits) || cands[cands.length - 1];
    }
    next = cur;
  }
  if (!fits(next) || next === old) { pending.push(`${rel}: ${old}`); continue; }
  const enc = encode(next), encOld = m[1];
  html = html.replace(`<title>${encOld}</title>`, `<title>${enc}</title>`);
  for (const prop of ['property="og:title"', 'name="twitter:title"']) {
    html = html.replace(new RegExp(`(<meta ${prop} content=")${encOld.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(">)`), `$1${enc}$2`);
  }
  if (!DRY) fs.writeFileSync(file, html);
  changed++;
  if (DRY) console.log(`${old.length}→${next.length}  ${next}`);
}
console.log(`Títulos acortados: ${changed}.`);
if (pending.length) console.log('Sin regla (revisar a mano):\n  ' + pending.join('\n  '));
