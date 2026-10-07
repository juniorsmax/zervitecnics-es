#!/usr/bin/env node
/* Alt honestos + width/height en imágenes repetidas. Repetible (idempotente). */
'use strict';
const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
const MAP={
 'hero_split':{alt:'Imagen ilustrativa: split de pared en un salón',w:1200,h:900},
 'barcelona_aerial':{alt:'Vista aérea del Eixample de Barcelona (imagen ilustrativa)',w:1200,h:674},
 'multisplit_service':{alt:'Imagen ilustrativa: instalación multisplit',w:1200,h:675},
 'conductos_service':{alt:'Imagen ilustrativa: aire acondicionado por conductos',w:1200,h:675},
 'logo_zervitecnics':{w:560,h:120}
};
function walk(d,o=[]){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(['node_modules','.git','docs','tools'].includes(e.name))continue;const p=path.join(d,e.name);e.isDirectory()?walk(p,o):/\.html$/.test(e.name)&&o.push(p)}return o}
let files=0,tags=0;
for(const f of walk(ROOT)){
 let s=fs.readFileSync(f,'utf8'),n=s;
 n=n.replace(/<img\b[^>]*>/g,t=>{
  const m=/src="(?:[^"]*\/)?([a-z_]+)\.(?:jpg|png|webp)"/.exec(t); if(!m||!MAP[m[1]])return t;
  const c=MAP[m[1]];let r=t;
  if(c.alt)r=r.replace(/alt="[^"]*"/,`alt="${c.alt}"`);
  r=r.replace(/\s+width="\d+"/,'').replace(/\s+height="\d+"/,'');
  r=r.replace(/<img\b/,`<img width="${c.w}" height="${c.h}"`);
  if(r!==t)tags++;return r;});
 if(n!==s){fs.writeFileSync(f,n);files++}
}
console.log(`[alts] ${tags} etiquetas en ${files} archivos`);
