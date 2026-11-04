import { useMemo } from 'react';
import * as THREE from 'three';

interface OrbitPathProps {
  radius: number;
  color?: string;
  opacity?: number;
}

export function OrbitPath({ radius, color = '#444455', opacity = 0.35 }: OrbitPathProps) {
  // Aquí useMemo sí se justifica: construir geometría y material de Three.js es
  // caro y, sin memo, se recrearían en cada render.
  const lineObj = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
    const points = curve.getPoints(180).map(p => new THREE.Vector3(p.x, 0, p.y));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    return new THREE.Line(geometry, material);
  }, [radius, color, opacity]);

  return <primitive object={lineObj} />;
}
