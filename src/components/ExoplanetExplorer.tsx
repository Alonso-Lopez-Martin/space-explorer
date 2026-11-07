import { useState } from 'react';
import { SearchBar } from './SearchBar';
import { PlanetList } from './PlanetList';
import { PlanetViewer } from './PlanetViewer';
import { RecentSearches } from './RecentSearches';
import { useNasaApi } from '../hooks/useNasaApi';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { selectDisplayPlanet } from '../utils/astro-calc';

const MAX_HISTORY = 6;
const EMPTY_HISTORY: string[] = [];

// Helper puro fuera del componente para actualizar el historial sin mutar ni duplicar entradas.
function prependUniqueQuery(history: string[], query: string): string[] {
  const canonical = query.toLowerCase();
  const rest = history.filter((item) => item.toLowerCase() !== canonical);
  return [query, ...rest].slice(0, MAX_HISTORY);
}

// Vista del explorador: guarda únicamente strings ligeros (el borrador del input,
// la consulta confirmada y el nombre del planeta seleccionado) y deriva `displayPlanet`
// en cada render a partir de `data`.
export function ExoplanetExplorer() {
  const [searchQuery, setSearchQuery] = useLocalStorage<string>('space-explorer:last-query', '');
  const [history, setHistory] = useLocalStorage<string[]>('space-explorer:history', EMPTY_HISTORY);
  const [draftQuery, setDraftQuery] = useState<string>(searchQuery);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const { data, loading, error, reload } = useNasaApi(searchQuery);

  const displayPlanet = selectDisplayPlanet(data, selectedName, searchQuery);

  const handleSearch = (query: string) => {
    setDraftQuery(query);
    setSelectedName(null);
    if (query.toLowerCase() === searchQuery.toLowerCase()) {
      reload();
    } else {
      setSearchQuery(query);
    }
    setHistory((prev) => prependUniqueQuery(prev, query));
  };

  const isNotFound: boolean = searchQuery !== '' && !loading && !error && data.length === 0;

  return (
    <>
      <SearchBar
        value={draftQuery}
        onChange={setDraftQuery}
        onSearch={handleSearch}
        loading={loading}
      />

      <RecentSearches
        history={history}
        currentQuery={searchQuery}
        onSelectQuery={handleSearch}
        onClear={() => setHistory(EMPTY_HISTORY)}
      />

      {error && <p className="estado-mensaje error-box">⚠ {error}</p>}
      {isNotFound && <p className="estado-mensaje error-box">⚠ No se encontraron resultados para "{searchQuery}".</p>}

      <PlanetList
        planets={data}
        selectedPlanet={displayPlanet}
        onSelect={(planet) => setSelectedName(planet.pl_name)}
      />

      <PlanetViewer
        planet={displayPlanet}
        totalMatches={data.length}
      />
    </>
  );
}