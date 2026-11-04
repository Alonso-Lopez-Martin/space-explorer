import { StatItem } from './StatItem';
import { PlanetSphere } from './PlanetSphere';
import { calculateMetrics } from '../utils/astro-calc';
import type { Exoplanet } from '../utils/astro-calc';

interface PlanetViewerProps {
  planet: Exoplanet | null;
  totalMatches: number;
  comparedPlanet?: Exoplanet | null;
  onToggleCompare?: (planet: Exoplanet) => void;
}

// Componente puramente presentacional: toda la conversión de unidades, redondeos
// y cálculo de tamaño viven en calculateMetrics (astro-calc.ts).
export function PlanetViewer({ planet, totalMatches, comparedPlanet, onToggleCompare }: PlanetViewerProps) {
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
  const isPinned = comparedPlanet?.pl_name === planet.pl_name;

  return (
    <div className="viewer-container">
      <div id="planet-display">
        <PlanetSphere sizePx={metrics.sizePx} textureUrl={metrics.textura} />
      </div>
      <div className="data-corner">
        <div className="viewer-title-row">
          <div>
            <div className="metadata-stats">Resultados en este sector: {totalMatches}.</div>
            <h3>{planet.pl_name}</h3>
          </div>
          {onToggleCompare && (
            <button
              type="button"
              aria-pressed={isPinned}
              className="btn-secondary compare-pin-btn"
              onClick={() => onToggleCompare(planet)}
            >
              {isPinned ? '✓ Fijado para comparar' : '⚖ Fijar para comparar'}
            </button>
          )}
        </div>
        <ul className="data-grid">
          {metrics.stats.map((item) => (
            <StatItem key={item.label} label={item.label} value={item.value} unit={item.unit} />
          ))}
        </ul>
      </div>
    </div>
  );
}