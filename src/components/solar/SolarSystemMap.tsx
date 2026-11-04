import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useState } from 'react';
import * as THREE from 'three';
import { planetsData } from '../../data/solarSystem';
import { useJplPositions } from '../../hooks/useJplPositions';
import { useFocusTarget, type FocusState } from '../../hooks/useFocusTarget';
import { CameraController } from './CameraController';
import { PlanetBody } from './PlanetBody';
import { Sun } from './Sun';
import { BodyInfoPanel } from './BodyInfoPanel';
import { BodySelector } from './BodySelector';
import { SolarLoadingOverlay } from './SolarLoadingOverlay';

const ORIGIN = new THREE.Vector3(0, 0, 0);
const INITIAL_FOCUS: FocusState = { planet: null, moon: null };

// Orquestador puro del mapa: guarda el foco en un único estado { planet, moon },
// delega el cálculo de coordenadas/radio del objetivo en `useFocusTarget` y
// reparte el dibujo en los componentes de esta carpeta.
export function SolarSystemMap() {
  const { positions, loading } = useJplPositions();
  const [focus, setFocus] = useState<FocusState>(INITIAL_FOCUS);

  const { currentPlanet, currentMoon, targetCoords, targetSize } = useFocusTarget(focus, positions);

  const handlePlanetClick = (planetName: string) => {
    setFocus({ planet: planetName, moon: null });
  };

  const handleMoonClick = (moonName: string) => {
    setFocus((prev) => ({ ...prev, moon: moonName }));
  };

  const handleResetView = () => {
    setFocus(INITIAL_FOCUS);
  };

  return (
    <div className="solar-map-container">
      {loading && <SolarLoadingOverlay />}

      {focus.planet && (
        <BodyInfoPanel
          focusedName={focus.planet}
          planet={currentPlanet}
          moon={currentMoon}
          selectedMoon={focus.moon}
          onSelectMoon={handleMoonClick}
          onReset={handleResetView}
        />
      )}

      <BodySelector focused={focus.planet} onSelect={handlePlanetClick} />

      <Canvas camera={{ position: [0, 180, 420], fov: 45, far: 20000 }} onPointerMissed={handleResetView}>
        <ambientLight intensity={0.45} />
        <pointLight position={[0, 0, 0]} intensity={3.5} color="#fff8e7" />
        <Stars radius={800} depth={400} count={15000} factor={6} fade />

        <CameraController
          targetCoords={targetCoords}
          targetSize={targetSize}
          focusKey={`${focus.planet ?? 'home'}-${focus.moon ?? 'none'}`}
        />

        <Sun onSelect={() => handlePlanetClick('Sol')} />

        {positions &&
          planetsData.map((planet) => (
            <PlanetBody
              key={planet.name}
              data={planet}
              position={positions[planet.name] ?? ORIGIN}
              isFocused={focus.planet === planet.name}
              selectedMoon={focus.moon}
              onPlanetClick={() => handlePlanetClick(planet.name)}
              onMoonClick={handleMoonClick}
            />
          ))}
      </Canvas>
    </div>
  );
}