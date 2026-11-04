import { planetsData } from '../../data/solarSystem';
import { cn } from '../../utils/cn';

interface BodySelectorProps {
  focused: string | null;
  onSelect: (name: string) => void;
}

// Barra inferior para saltar a cualquier astro sin tener que clicar en la escena.
// Usa clases CSS en index.css (.body-selector, .selector-chip) y el helper `cn`.
export function BodySelector({ focused, onSelect }: BodySelectorProps) {
  const isSunActive = focused === 'Sol';

  return (
    <div className="body-selector">
      <button
        type="button"
        aria-pressed={isSunActive}
        className={cn('selector-chip', 'selector-chip-sun', isSunActive && 'active')}
        onClick={() => onSelect('Sol')}
      >
        ☀ Sol
      </button>
      {planetsData.map(p => {
        const isActive = focused === p.name;
        return (
          <button
            key={p.name}
            type="button"
            aria-pressed={isActive}
            className={cn('selector-chip', isActive && 'active')}
            onClick={() => onSelect(p.name)}
          >
            {p.name}
          </button>
        );
      })}
    </div>
  );
}