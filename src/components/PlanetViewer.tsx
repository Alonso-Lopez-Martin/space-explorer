import { StatItem } from './StatItem';
import { PlanetSphere } from './PlanetSphere';
import { calculateMetrics } from '../utils/astro-calc';
import type { Exoplanet } from '../utils/astro-calc';

interface PlanetViewerProps {
  planet: Exoplanet | null;
  totalMatches: number;
}

// Componente puramente presentacional: toda la conversión de unidades, redondeos
// y cálculo de tamaño viven en calculateMetrics (astro-calc.ts).
export function PlanetViewer({ planet, totalMatches }: PlanetViewerProps) {
  if (!planet) {
    return (
      <div className="viewer-container">
        <div id="planet-display">
          <p className="viewer-placeholder">Inicia una búsqueda para visualizar telemetría.</p>
        </div>
      </div>
    );
  }

  const metrics = calculateMetrics(planet);

  return (
    <div className="viewer-container">
      <div id="planet-display">
        <PlanetSphere sizePx={metrics.sizePx} textureUrl={metrics.textura} />
      </div>
      <div className="data-corner">
        <div className="metadata-stats">
          Resultados en este sector: {totalMatches}.
        </div>
        <h3>{planet.pl_name}</h3>
        <ul className="data-grid">
          {metrics.stats.map((item) => (
            <StatItem key={item.label} label={item.label} value={item.value} unit={item.unit} />
          ))}
        </ul>
      </div>
    </div>
  );
}