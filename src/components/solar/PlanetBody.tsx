import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
// Importamos también MoonData para tipar el map
import type { PlanetData, MoonData } from '../../data/solarSystem';
import { OrbitPath } from './OrbitPath';
import { MoonBody } from './MoonBody';
import { BodyLabel } from './BodyLabel';
import { hoverCursor } from './hoverCursor';

const EMISSIVE_FOCUSED = new THREE.Color(0x181818);
const EMISSIVE_IDLE = new THREE.Color(0x050505);

interface PlanetBodyProps {
  data: PlanetData;
  position: THREE.Vector3;
  isFocused: boolean;
  selectedMoon: string | null;
  onPlanetClick: () => void;
  onMoonClick: (moonName: string) => void;
}

export function PlanetBody({ data, position, isFocused, selectedMoon, onPlanetClick, onMoonClick }: PlanetBodyProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(data.texture);
  const orbitRadius = Math.hypot(position.x, position.z);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  const baseEmissive = data.tint ? new THREE.Color(data.tint) : EMISSIVE_IDLE;
  const activeEmissive = isFocused 
    ? new THREE.Color(baseEmissive).add(EMISSIVE_FOCUSED) 
    : baseEmissive;

  return (
    <group>
      {orbitRadius > 0 && <OrbitPath radius={orbitRadius} color={data.color} opacity={isFocused ? 0.65 : 0.35} />}

      <group position={position}>
        <mesh
          ref={meshRef}
          onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onPlanetClick(); }}
          {...hoverCursor}
        >
          <sphereGeometry args={[data.size, 64, 64]} />
          <meshStandardMaterial 
            map={texture} 
            color="#ffffff" 
            emissive={activeEmissive} 
          />
        </mesh>

        <BodyLabel name={data.name} variant="planet" active={isFocused} color={data.color} height={data.size + 1.8} onSelect={onPlanetClick} />

        {/* Tipado estricto explícito en el map para evitar el error de 'any' */}
        {isFocused && data.moons.map((moon: MoonData) => (
          <MoonBody
            key={moon.name}
            data={moon}
            isSelected={selectedMoon === moon.name}
            onSelect={() => onMoonClick(moon.name)}
          />
        ))}
      </group>
    </group>
  );
}