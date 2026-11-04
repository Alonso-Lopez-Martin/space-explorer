import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

const HOME_POSITION = new THREE.Vector3(0, 180, 420);

interface CameraControllerProps {
  targetCoords: [number, number, number] | null;
  targetSize: number;
  focusKey: string;
}

export function CameraController({ targetCoords, targetSize, focusKey }: CameraControllerProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const isTransitioning = useRef(false);
  const desiredCameraPos = useRef(HOME_POSITION.clone());
  const desiredTarget = useRef(new THREE.Vector3(0, 0, 0));

  // Extraemos las coordenadas a números primitivos para que las dependencias del
  // useEffect sean valores escalares estables y no una referencia de objeto (Vector3)
  // que podría cambiar de identidad entre renders y relanzar la transición.
  const hasTarget = targetCoords !== null;
  const targetX = targetCoords ? targetCoords[0] : 0;
  const targetY = targetCoords ? targetCoords[1] : 0;
  const targetZ = targetCoords ? targetCoords[2] : 0;

  // Este efecto sí hace falta: sincroniza el foco (props) con refs mutables que
  // lee el bucle de render de Three.js. No se puede hacer durante el render
  // porque escribir en refs ahí rompe la pureza del componente.
  useEffect(() => {
    isTransitioning.current = true;
    if (hasTarget) {
      desiredTarget.current.set(targetX, targetY, targetZ);
      const dist = Math.max(targetSize * 4.2, 12);
      desiredCameraPos.current.set(
        targetX + dist * 0.8,
        targetY + dist * 0.45,
        targetZ + dist
      );
    } else {
      desiredTarget.current.set(0, 0, 0);
      desiredCameraPos.current.copy(HOME_POSITION);
    }
  }, [focusKey, hasTarget, targetX, targetY, targetZ, targetSize]);

  // Transición suave (lerp) hacia el objetivo. En cuanto el usuario toca los
  // controles (onStart) se corta, para no pelear con su zoom o su paneo.
  useFrame(() => {
    if (!controlsRef.current || !isTransitioning.current) return;

    controlsRef.current.target.lerp(desiredTarget.current, 0.08);
    camera.position.lerp(desiredCameraPos.current, 0.08);
    controlsRef.current.update();

    if (camera.position.distanceTo(desiredCameraPos.current) < 0.8) {
      isTransitioning.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableZoom
      enablePan
      maxDistance={5000}
      minDistance={3}
      onStart={() => { isTransitioning.current = false; }}
    />
  );
}