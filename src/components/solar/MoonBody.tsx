import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import type { MoonData } from '../../data/solarSystem';
import { OrbitPath } from './OrbitPath';
import { BodyLabel } from './BodyLabel';
import { hoverCursor } from './hoverCursor';

const EMISSIVE_ON = new THREE.Color(0x333333);
const EMISSIVE_OFF = new THREE.Color(0x000000);

interface MoonBodyProps {
  data: MoonData;
  isSelected: boolean;
  onSelect: () => void;
}

export function MoonBody({ data, isSelected, onSelect }: MoonBodyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(data.texture);
  // Ángulo inicial repartido según la distancia. Antes se fijaba con un
  // useEffect (render con valor 0 + corrección); como solo depende de las props
  // iniciales, basta con pasarlo como valor inicial del ref.
  const angleRef = useRef((data.distance * 1.7) % (Math.PI * 2));

  useFrame(() => {
    if (!isSelected && groupRef.current) {
      angleRef.current += data.speed * 0.3;
      groupRef.current.position.x = Math.cos(angleRef.current) * data.distance;
      groupRef.current.position.z = Math.sin(angleRef.current) * data.distance;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group>
      <OrbitPath radius={data.distance} color="#8899aa" opacity={0.4} />
      <group ref={groupRef} position={[data.distance, 0, 0]}>
        <mesh
          ref={meshRef}
          onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(); }}
          {...hoverCursor}
        >
          <sphereGeometry args={[data.size, 32, 32]} />
          <meshStandardMaterial map={texture} emissive={isSelected ? EMISSIVE_ON : EMISSIVE_OFF} />
        </mesh>
        <BodyLabel name={data.name} variant="moon" active={isSelected} height={data.size + 0.8} onSelect={onSelect} />
      </group>
    </group>
  );
}
