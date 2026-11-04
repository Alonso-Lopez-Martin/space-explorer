import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { planetsData, fallbackAU, SOLAR_SCALE } from '../data/solarSystem';
import { fetchJPLPosition } from '../utils/jpl';

export interface JplPositionsState {
  positions: Record<string, THREE.Vector3> | null;
  loading: boolean;
  usingFallback: boolean;
  error: string | null;
}

// Construye el mapa completo de posiciones aproximadas si ocurriera un fallo general.
function buildAllFallbackPositions(): Record<string, THREE.Vector3> {
  const posMap: Record<string, THREE.Vector3> = {};
  planetsData.forEach((p, i) => {
    const dist = fallbackAU[p.id] * SOLAR_SCALE;
    const angle = i * 1.1 + 0.5;
    posMap[p.name] = new THREE.Vector3(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
  });
  return posMap;
}

// Descarga en paralelo (Promise.all) las efemérides de los 8 planetas al montar
// el mapa, sin retardos secuenciales fijos, y distingue en el catch entre
// cancelación por desmontaje y error real.
export function useJplPositions(): JplPositionsState {
  const [positions, setPositions] = useState<Record<string, THREE.Vector3> | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const results = await Promise.all(
          planetsData.map((p, i) => fetchJPLPosition(p.id, i, controller.signal))
        );
        if (controller.signal.aborted) return;

        const posMap: Record<string, THREE.Vector3> = {};
        let anyFallback = false;
        planetsData.forEach((p, i) => {
          posMap[p.name] = results[i].position;
          if (results[i].fromFallback) anyFallback = true;
        });

        setPositions(posMap);
        setUsingFallback(anyFallback);
        setError(null);
      } catch (err: unknown) {
        // Si fue cancelación por desmontar el componente, salimos en silencio.
        if (controller.signal.aborted) return;
        // Si es un error inesperado real, no lo tragamos: informamos al usuario
        // y cargamos las posiciones orbitales de reserva para que el mapa siga siendo usable.
        const msg = err instanceof Error ? err.message : 'Error al calcular efemérides';
        setError(msg);
        setUsingFallback(true);
        setPositions(buildAllFallbackPositions());
      }
    })();

    return () => controller.abort();
  }, []);

  return {
    positions,
    loading: positions === null,
    usingFallback,
    error,
  };
}