import type { ThreeEvent } from '@react-three/fiber';
import { BodyLabel } from './BodyLabel';
import { hoverCursor } from './hoverCursor';

export const SUN_RADIUS = 14;

export function Sun({ onSelect }: { onSelect: () => void }) {
  return (
    <group>
      <mesh onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(); }} {...hoverCursor}>
        <sphereGeometry args={[SUN_RADIUS, 64, 64]} />
        <meshBasicMaterial color="#ffcc00" />
      </mesh>
      <BodyLabel name="Sol" variant="sun" height={SUN_RADIUS + 3} onSelect={onSelect} />
    </group>
  );
}
