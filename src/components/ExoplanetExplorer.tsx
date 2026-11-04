import { useState } from 'react';
import { SearchBar } from './SearchBar';
import { PlanetList } from './PlanetList';
import { PlanetViewer } from './PlanetViewer';
import { RecentSearches } from './RecentSearches';
import { PlanetComparison } from './PlanetComparison';
import { useNasaApi } from '../hooks/useNasaApi';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { selectDisplayPlanet, type Exoplanet } from '../utils/astro-calc';

const MAX_HISTORY = 6;
const EMPTY_HISTORY: string[] = [];

// Helper puro fuera del componente para actualizar el historial sin mutar ni duplicar entradas.
function prependUniqueQuery(history: string[], query: string): string[] {
  const canonical = query.toLowerCase();
  const rest = history.filter((item) => item.toLowerCase() !== canonical);
  return [query, ...rest].slice(0, MAX_HISTORY);
}

// Vista del explorador.
// Sobre las decisiones de estado en este componente:
// 1) `draftQuery` (lo que hay escrito en el input) y `searchQuery` (la consulta confirmada
//    que dispara el fetch) viven aquí. Elevar `draftQuery` permite que SearchBar sea un
//    componente controlado normal sin tener que remontarlo con `key={searchQuery}` cuando
//    el usuario pulsa un chip de RecentSearches, y sin disparar peticiones en cada tecla.
// 2) Para el planeta mostrado de la búsqueda actual guardamos solo su nombre (`selectedName`)
//    y derivamos `displayPlanet` desde `data` en cada render.
// 3) En cambio, `comparedPlanet` guarda el objeto `Exoplanet` fijado y NO solo su nombre
//    a propósito: como explicó el profesor en clase al hablar de estado derivado, solo se
//    puede derivar un elemento por su ID si sigue formando parte del array `data` en memoria.
//    El caso de uso principal del comparador es fijar un planeta de una búsqueda (por ejemplo
//    "Kepler-22 b") y después hacer otra búsqueda distinta (por ejemplo "TRAPPIST-1 e") para
//    compararlos cara a cara. Al lanzar la segunda búsqueda, `data` pasa a tener solo los
//    planetas de TRAPPIST-1 y `Kepler-22 b` ya no existe en `data`; si solo guardáramos su
//    nombre, devolvería `undefined` y se rompería la comparativa entre sistemas distintos.
export function ExoplanetExplorer() {
  const [searchQuery, setSearchQuery] = useLocalStorage<string>('space-explorer:last-query', '');
  const [history, setHistory] = useLocalStorage<string[]>('space-explorer:history', EMPTY_HISTORY);
  const [draftQuery, setDraftQuery] = useState<string>(searchQuery);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [comparedPlanet, setComparedPlanet] = useState<Exoplanet | null>(null);

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

  const handleToggleCompare = (planet: Exoplanet) => {
    setComparedPlanet((prev) => (prev?.pl_name === planet.pl_name ? null : planet));
  };

  const isNotFound: boolean = searchQuery !== '' && !loading && !error && data.length === 0;
  const showComparison =
    comparedPlanet !== null && displayPlanet !== null && comparedPlanet.pl_name !== displayPlanet.pl_name;

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

      {showComparison && displayPlanet && (
        <PlanetComparison
          basePlanet={comparedPlanet}
          currentPlanet={displayPlanet}
          onClose={() => setComparedPlanet(null)}
        />
      )}

      <PlanetViewer
        planet={displayPlanet}
        totalMatches={data.length}
        comparedPlanet={comparedPlanet}
        onToggleCompare={handleToggleCompare}
      />
    </>
  );
}