import { cn } from '../utils/cn';

interface RecentSearchesProps {
  history: string[];
  currentQuery: string;
  onSelectQuery: (query: string) => void;
  onClear: () => void;
}

// Barra de búsquedas recientes persistida en localStorage.
// Usamos `item.toLowerCase()` como key para que sea imposible una colisión
// aunque dos entradas difirieran en mayúsculas.
export function RecentSearches({ history, currentQuery, onSelectQuery, onClear }: RecentSearchesProps) {
  if (history.length === 0) return null;

  return (
    <div className="recent-searches">
      <span className="matches-label">Búsquedas recientes:</span>
      {history.map((item) => {
        const canonicalKey = item.toLowerCase();
        const isCurrent = canonicalKey === currentQuery.toLowerCase();
        return (
          <button
            key={canonicalKey}
            type="button"
            aria-pressed={isCurrent}
            className={cn('match-btn', isCurrent && 'active')}
            onClick={() => onSelectQuery(item)}
          >
            {item}
          </button>
        );
      })}
      <button type="button" className="recent-clear-btn" onClick={onClear}>
        Limpiar historial
      </button>
    </div>
  );
}