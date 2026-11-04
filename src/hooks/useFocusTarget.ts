import type * as THREE from 'three';
import { planetsData, type PlanetData, type MoonData } from '../data/solarSystem';
import { SUN_RADIUS } from '../components/solar/Sun';

export interface FocusState {
  planet: string | null;
  moon: string | null;
}

export interface FocusTargetResult {
  currentPlanet: PlanetData | null;
  currentMoon: MoonData | null;
  targetCoords: [number, number, number] | null;
  targetSize: number;
}

// Extraído de SolarSystemMap para que el componente principal sea únicamente
// un orquestador declarativo y no mezcle ramas if/else de cálculo de coordenadas.
export function useFocusTarget(
  focus: FocusState,
  positions: Record<string, THREE.Vector3> | null
): FocusTargetResult {
  const currentPlanet = planetsData.find((p) => p.name === focus.planet) ?? null;
  const currentMoon = currentPlanet?.moons.find((m) => m.name === focus.moon) ?? null;

  let targetCoords: [number, number, number] | null = null;
  let targetSize = 1;

  if (focus.planet === 'Sol') {
    targetCoords = [0, 0, 0];
    targetSize = SUN_RADIUS;
  } else if (currentPlanet && positions?.[currentPlanet.name]) {
    const pos = positions[currentPlanet.name];
    targetCoords = [pos.x, pos.y, pos.z];
    targetSize = currentPlanet.size;
  }

  return {
    currentPlanet,
    currentMoon,
    targetCoords,
    targetSize,
  };
}