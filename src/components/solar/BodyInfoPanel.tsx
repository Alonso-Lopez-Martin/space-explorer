import type { MoonData, PlanetData } from '../../data/solarSystem';
import { cn } from '../../utils/cn';

const SUN_TEXT = 'El Sol contiene el 99.8% de la masa de todo el Sistema Solar.';

interface BodyInfoPanelProps {
  focusedName: string;
  planet: PlanetData | null;
  moon: MoonData | null;
  selectedMoon: string | null;
  onSelectMoon: (moonName: string) => void;
  onReset: () => void;
}

// Panel lateral de información del astro enfocado. Todos los estilos viven
// ahora en clases de index.css (.body-info-panel, .moon-chip, etc.) sin estilos inline.
export function BodyInfoPanel({
  focusedName,
  planet,
  moon,
  selectedMoon,
  onSelectMoon,
  onReset,
}: BodyInfoPanelProps) {
  const kicker = moon ? `${focusedName} › Satélite` : (planet?.type ?? 'Estrella Central');
  const title = moon ? moon.name : focusedName;
  const description = moon ? moon.description : (planet?.description ?? SUN_TEXT);

  return (
    <aside className="body-info-panel">
      <div className="body-info-kicker">{kicker}</div>
      <h2 className="body-info-title">{title}</h2>
      <p className="body-info-desc">{description}</p>

      {planet && planet.moons.length > 0 && (
        <div className="body-info-moons">
          <div className="body-info-moons-label">
            Lunas en este sistema ({planet.moons.length}):
          </div>
          <div className="body-info-moons-list">
            {planet.moons.map(m => {
              const isActive = selectedMoon === m.name;
              return (
                <button
                  key={m.name}
                  type="button"
                  aria-pressed={isActive}
                  className={cn('moon-chip', isActive && 'active')}
                  onClick={() => onSelectMoon(m.name)}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button type="button" className="body-info-reset-btn" onClick={onReset}>
        ← Vista Global del Sistema Solar
      </button>
    </aside>
  );
}