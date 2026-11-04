import { useFetch } from './useFetch';
import type { Exoplanet } from '../utils/astro-calc';

const NO_RESULTS: Exoplanet[] = [];
const API_BASE = import.meta.env.DEV ? '/api/nasa' : 'https://exoplanetarchive.ipac.caltech.edu';

// Diccionario local estático.
// Claves: SIEMPRE en minúsculas, sin tildes y con espacios simples.
const LOCAL_ALIASES: Record<string, string> = {
  "belerofonte": "51 Peg b",
  "51 pegasi b": "51 Peg b",
  "osiris": "HD 209458 b",
  "matusalen": "PSR B1620-26 b",
  "methuselah": "PSR B1620-26 b",
  "galileo": "55 Cnc b",
  "brahe": "55 Cnc c",
  "lippershey": "55 Cnc d",
  "janssen": "55 Cnc e",
  "harriot": "55 Cnc f",
  "dagon": "Fomalhaut b",
  "poltergeist": "PSR B1257+12 c",
  "phobetor": "PSR B1257+12 d",
  "draugr": "PSR B1257+12 b",
  "smertrios": "HD 149026 b",
  "proxima centauri b": "Proxima Cen b",
  "proxima b": "Proxima Cen b",
  "ct chamaeleontis b": "CT Cha b",
  "koi-571.05": "Kepler-186 f",
  "koi 571.05": "Kepler-186 f"
};

// --- CONSTRUCCIÓN DE CONSULTA PRINCIPAL ---
function buildUrl(query: string): string {
  let cleanQuery = query.toLowerCase().trim();
  
  // 1. Quitar acentos para poder comparar bien con el diccionario local
  cleanQuery = cleanQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 2. Comprobar si el nombre normalizado está en nuestro diccionario de alias
  if (LOCAL_ALIASES[cleanQuery]) {
    cleanQuery = LOCAL_ALIASES[cleanQuery].toLowerCase();
  }
  
  // 3. Arreglo TRAPPIST: Forzar guion y espacio (trappist1b, trappist-1b -> trappist-1 b)
  cleanQuery = cleanQuery.replace(/trappist[\s-]*1[\s-]*([a-z])/g, 'trappist-1 $1');
  
  // 4. Insertar espacio entre número y letra (genérico para Kepler, TOI, etc.)
  if (!cleanQuery.includes('trappist')) {
    cleanQuery = cleanQuery.replace(/([0-9])([a-z])/g, '$1 $2');
  }
  
  // 5. Escapar comillas simples para que la consulta SQL no se rompa
  let sqlSafe = cleanQuery.replaceAll(/'/g, "''");
  
  // 6. Convertir múltiples espacios (y guiones/sumas sueltos) en el comodín %
  sqlSafe = sqlSafe.replace(/[-+\s]+/g, '%');

  const sql = `select pl_name,pl_rade,pl_bmasse,pl_eqt,pl_orbper,discoverymethod,disc_year,hostname,sy_dist from ps where default_flag=1 and lower(pl_name) like '%${sqlSafe}%'`;
  
  return `${API_BASE}/TAP/sync?query=${encodeURIComponent(sql)}&format=json`;
}

// Función de módulo (identidad estable) para que useFetch no relance el efecto.
// Nota sobre la deduplicación: la tabla `ps` (Planetary Systems) de la NASA puede
// devolver varias filas para un mismo planeta (distintas publicaciones o soluciones
// orbitales incluso con default_flag=1) y a veces varía las mayúsculas. Guardamos
// por `pl_name.toLowerCase()` en un Map para quedarnos con una única entrada por
// planeta y garantizar que `pl_name` sea una key 100% única en PlanetList.
function parseExoplanets(json: unknown): Exoplanet[] {
  if (!Array.isArray(json)) throw new Error('Formato inválido.');
  const unique = new Map<string, Exoplanet>();
  for (const p of json as Exoplanet[]) {
    if (p.pl_name) unique.set(p.pl_name.toLowerCase(), p);
  }
  return [...unique.values()].sort((a, b) => (a.disc_year || 0) - (b.disc_year || 0));
}

// Capa fina sobre el hook genérico useFetch: solo sabe construir la consulta
// ADQL del archivo de exoplanetas. Con query vacía no se hace petición y se
// devuelve la lista vacía (data se resetea sola).
export function useNasaApi(query: string) {
  const activeUrl = query ? buildUrl(query) : null;
  const { data, loading, error, reload } = useFetch(activeUrl, parseExoplanets);
  return { data: data ?? NO_RESULTS, loading, error, reload };
}