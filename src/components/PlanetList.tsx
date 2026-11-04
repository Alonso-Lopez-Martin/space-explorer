import type { Exoplanet } from '../utils/astro-calc';
import { cn } from '../utils/cn';

interface PlanetListProps {
  planets: Exoplanet[];
  selectedPlanet: Exoplanet | null;
  onSelect: (planet: Exoplanet) => void;
}

export function PlanetList({ planets, selectedPlanet, onSelect }: PlanetListProps) {
  if (planets.length <= 1) return null;

  return (
    <div className="matches-container">
      <span className="matches-label">Encontrados en este sector:</span>
      {planets.map((planet) => {
        // Se calcula una sola vez por botón y se reutiliza en aria y en la clase con `cn`.
        const isActive = selectedPlanet?.pl_name === planet.pl_name;
        return (
          <button
            type="button"
            key={planet.pl_name}
            aria-pressed={isActive}
            className={cn('match-btn', isActive && 'active')}
            onClick={() => onSelect(planet)}
          >
            {planet.pl_name}
          </button>
        );
      })}
    </div>
  );
}