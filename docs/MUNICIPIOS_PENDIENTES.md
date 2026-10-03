# Municipios pendientes de enlazado interno

> **Contexto**: en la primera tanda de la rama `enlaces-internos` solo se han
> enlazado 17 ciudades (las 8 que ya tenían página de zona + 9 municipios
> adicionales del Barcelonès y Baix Llobregat). Las 23 ciudades listadas abajo
> siguen con 0 enlaces entrantes a sus 14 páginas (10 marca-ciudad + 4
> capacidad-ciudad = 322 páginas totales entre todas ellas).
>
> Estas páginas no se han modificado en esta tanda y permanecen idénticas
> (verificable con los hashes de `/tmp/before/excluded-hashes.txt`).

## Comarca Maresme (10 municipios · 140 páginas)

| Slug | Nombre | km desde Barcelona |
|---|---|---:|
| `mataro` | Mataró | 33 |
| `el-masnou` | El Masnou | 16 |
| `premia-de-mar` | Premià de Mar | 20 |
| `vilassar-de-mar` | Vilassar de Mar | 23 |
| `argentona` | Argentona | 30 |
| `cabrils` | Cabrils | 25 |
| `arenys-de-mar` | Arenys de Mar | 38 |
| `canet-de-mar` | Canet de Mar | 45 |
| `pineda-de-mar` | Pineda de Mar | 50 |
| `calella` | Calella | 53 |

## Comarca Vallès Oriental (7 municipios · 98 páginas)

| Slug | Nombre | km desde Barcelona |
|---|---|---:|
| `granollers` | Granollers | 31 |
| `mollet-del-valles` | Mollet del Vallès | 22 |
| `parets-del-valles` | Parets del Vallès | 24 |
| `cardedeu` | Cardedeu | 35 |
| `la-garriga` | La Garriga | 40 |
| `sant-celoni` | Sant Celoni | 50 |
| `caldes-de-montbui` | Caldes de Montbui | 33 |

## Comarca Vallès Occidental (5 municipios · 70 páginas)

| Slug | Nombre | km desde Barcelona |
|---|---|---:|
| `cerdanyola-del-valles` | Cerdanyola del Vallès | 16 |
| `rubi` | Rubí | 26 |
| `sant-quirze-del-valles` | Sant Quirze del Vallès | 24 |
| `castellar-del-valles` | Castellar del Vallès | 30 |
| `barbera-del-valles` | Barberà del Vallès | 18 |

## Comarca Garraf (1 municipio · 14 páginas)

| Slug | Nombre | km desde Barcelona |
|---|---|---:|
| `sitges` | Sitges | 38 |

## Siguiente tanda

Para cerrar el enlazado de estas 23 ciudades hay que:

1. Añadirlas al array de `tools/data/round1-cities.json` (renombrar a
   `round2-cities.json` o colapsar a `rounds-cities.json`).
2. Añadir en el hub un segundo bloque "Municipios del Maresme y Vallès"
   (23 enlaces a `capacidades/2500-frigorias-{ciudad}.html`) o distribuir
   entradas desde las cap-ciudad cabeza de comarca ya existentes (Mataró,
   Granollers, Cerdanyola).
3. Re-ejecutar `node tools/generate-geo-pages.js` y
   `node tools/generate-marca-capacidad.js`.
4. Re-ejecutar `node tools/add-cross-links.js` para refrescar marca raíz
   (bloque "Dónde instalamos {marca}" ampliado).
