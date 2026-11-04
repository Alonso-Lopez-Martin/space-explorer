export interface Exoplanet {
  pl_name: string;
  pl_rade: number | null;
  pl_bmasse: number | null;
  pl_eqt: number | null;
  pl_orbper: number | null;
  discoverymethod: string;
  disc_year: number;
  hostname: string;
  sy_dist: number | null;
}

export interface FormattedStat {
  label: string;
  value: string | number | null;
  unit?: string;
}

export interface PlanetMetrics {
  densidad: number | null;
  gravedad: number | null;
  distAL: number | null;
  habitabilidad: string;
  tipoPlaneta: string;
  textura: string;
  radioBase: number;
  sizePx: number;
  stats: FormattedStat[];
}

const TEXTURAS_POR_CATEGORIA = {
  lava: ['/Venus.jpg', '/Jupiter_Io(B).jpg'],
  templado: ['/Mars.jpg'],
  helado: ['/Pluto.jpg', '/Pluto_Charon.jpg', '/Jupiter_Europa.jpg', '/Jupiter_Ganymede.jpg', '/Jupiter_Callisto.jpg'],
  enano: ['/Mars_Phobos.jpg'],
  gaseoso: ['/Jupiter.jpg', '/Saturn.jpg'],
  oceano: ['/Neptune.jpg', '/Saturn_Titan.jpg'],
} as const;

type TexturaCategoria = keyof typeof TEXTURAS_POR_CATEGORIA;

// Helper puro para redondear a N decimales sin ensuciar el JSX de los componentes.
export function roundTo(val: number | null, decimals = 2): number | null {
  if (val === null) return null;
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

// 1. Cálculo de propiedades físicas básicas (radio estimado, densidad, gravedad y distancia).
function computePhysicalProps(planet: Exoplanet) {
  const radioBase =
    planet.pl_rade != null
      ? planet.pl_rade
      : planet.pl_bmasse != null
        ? Math.pow(planet.pl_bmasse, 0.33)
        : 1;

  let densidad: number | null = null;
  let gravedad: number | null = null;

  if (planet.pl_bmasse != null && planet.pl_rade != null && planet.pl_rade !== 0) {
    densidad = (planet.pl_bmasse / Math.pow(planet.pl_rade, 3)) * 5.51;
    gravedad = planet.pl_bmasse / Math.pow(planet.pl_rade, 2);
  }

  const distAL = planet.sy_dist != null ? Math.round(planet.sy_dist * 3.26156) : null;
  const sizePx = Math.round(150 * Math.min(Math.max(radioBase, 0.5), 2.5));

  return { radioBase, densidad, gravedad, distAL, sizePx };
}

// 2. Evaluación térmica y de habitabilidad.
function evaluateHabitability(temp: number | null, densidad: number | null): string {
  if (temp == null) return 'Desconocida';
  if (temp >= 273 && temp <= 373 && (densidad == null || densidad > 3.5)) {
    return 'Potencialmente Habitable 💧';
  }
  return temp < 273 ? 'Demasiado Frío ❄️' : 'Demasiado Caliente 🔥';
}

// 3. Clasificación astronómica y elección determinista de textura equirectangular.
function classifyPlanetAndTexture(
  planet: Exoplanet,
  radioBase: number,
  densidad: number | null
): { tipoPlaneta: string; textura: string } {
  const temp = planet.pl_eqt;
  let tipoPlaneta: string;
  let categoria: TexturaCategoria;

  if (radioBase < 0.5) {
    tipoPlaneta = 'Planeta Enano / Asteroide';
    categoria = 'enano';
  } else if (densidad != null) {
    if (densidad >= 4) {
      if (temp != null && temp > 800) {
        tipoPlaneta = 'Rocoso (Mundo de Lava)';
        categoria = 'lava';
      } else if (temp != null && temp > 200 && temp < 400) {
        tipoPlaneta = 'Rocoso (Templado)';
        categoria = 'templado';
      } else {
        tipoPlaneta = 'Rocoso (Helado/Yermo)';
        categoria = 'helado';
      }
    } else if (densidad >= 2) {
      tipoPlaneta = 'Mundo Océano / Minineptuno';
      categoria = 'oceano';
    } else {
      tipoPlaneta = 'Gigante Gaseoso';
      categoria = 'gaseoso';
    }
  } else if (radioBase < 1.6) {
    if (temp != null && temp > 800) {
      tipoPlaneta = 'Rocoso (Lava)';
      categoria = 'lava';
    } else if (temp != null && temp > 200 && temp < 400) {
      tipoPlaneta = 'Rocoso (Templado)';
      categoria = 'templado';
    } else {
      tipoPlaneta = 'Rocoso (Helado)';
      categoria = 'helado';
    }
  } else if (radioBase < 4) {
    tipoPlaneta = 'Supertierra / Gigante de Hielo';
    categoria = 'oceano';
  } else {
    tipoPlaneta = 'Gigante Gaseoso';
    categoria = 'gaseoso';
  }

  const orbitalSeed = Math.floor((planet.pl_orbper ?? planet.disc_year ?? 1) * 123.45);
  const opciones = TEXTURAS_POR_CATEGORIA[categoria];
  const textura = opciones[orbitalSeed % opciones.length];

  return { tipoPlaneta, textura };
}

// 4. Formateo de la lista de estadísticas listas para renderizar en StatItem.
function buildFormattedStats(
  planet: Exoplanet,
  props: {
    tipoPlaneta: string;
    habitabilidad: string;
    distAL: number | null;
    gravedad: number | null;
    densidad: number | null;
    radioBase: number;
  }
): FormattedStat[] {
  const radioFormateado = planet.pl_rade != null ? planet.pl_rade : `~${roundTo(props.radioBase, 1)}`;

  return [
    { label: 'Clasificación', value: props.tipoPlaneta },
    { label: 'Habitabilidad', value: props.habitabilidad },
    { label: 'Estrella', value: planet.hostname },
    { label: 'Distancia', value: props.distAL, unit: 'Años Luz' },
    { label: 'Gravedad', value: roundTo(props.gravedad, 2), unit: 'x 🌍 (g)' },
    { label: 'Radio', value: radioFormateado, unit: 'x 🌍' },
    { label: 'Masa', value: planet.pl_bmasse, unit: 'x 🌍' },
    { label: 'Densidad', value: roundTo(props.densidad, 2), unit: 'g/cm³' },
    { label: 'Temperatura', value: planet.pl_eqt, unit: 'K' },
    { label: 'Descubrimiento', value: `${planet.disc_year} (${planet.discoverymethod})` },
  ];
}

// Orquestador puro: combina las 4 funciones pequeñas para devolver todas las métricas.
export function calculateMetrics(planet: Exoplanet): PlanetMetrics {
  const { radioBase, densidad, gravedad, distAL, sizePx } = computePhysicalProps(planet);
  const habitabilidad = evaluateHabitability(planet.pl_eqt, densidad);
  const { tipoPlaneta, textura } = classifyPlanetAndTexture(planet, radioBase, densidad);
  const stats = buildFormattedStats(planet, {
    tipoPlaneta,
    habitabilidad,
    distAL,
    gravedad,
    densidad,
    radioBase,
  });

  return { densidad, gravedad, distAL, habitabilidad, tipoPlaneta, textura, radioBase, sizePx, stats };
}

// Función con nombre para resolver la prioridad del planeta mostrado:
// 1º elección manual del usuario -> 2º coincidencia exacta con la búsqueda -> 3º primer resultado.
export function selectDisplayPlanet(
  planets: Exoplanet[],
  selectedName: string | null,
  searchQuery: string
): Exoplanet | null {
  if (planets.length === 0) return null;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  return (
    planets.find(p => p.pl_name === selectedName) ??
    planets.find(p => p.pl_name.toLowerCase() === normalizedQuery) ??
    planets[0] ??
    null
  );
}