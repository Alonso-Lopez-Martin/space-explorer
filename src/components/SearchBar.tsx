import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  loading: boolean;
}

// SearchBar como componente controlado puro: el borrador (`value`) vive en
// ExoplanetExplorer y se actualiza con `onChange`, pero la consulta a la NASA
// solo se confirma al hacer submit (`onSearch`).
// Ventaja frente a usar `key={searchQuery}`: si el usuario pulsa un chip de
// búsquedas recientes, el input se actualiza limpiamente desde las props sin
// desmontar el nodo del DOM ni perder el foco.
export function SearchBar({ value, onChange, onSearch, loading }: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  };

  return (
    <form className="search-panel" onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ej: Kepler-22 b, TRAPPIST-1..."
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? (
          'Escaneando...'
        ) : (
          <>
            <Search size={18} className="search-btn-icon" /> Buscar
          </>
        )}
      </button>
      <a
        href="https://science.nasa.gov/exoplanet-catalog/"
        target="_blank"
        rel="noreferrer"
        className="btn-secondary"
      >
        Catálogo de la NASA
      </a>
    </form>
  );
}