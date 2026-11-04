import type { ThreeEvent } from '@react-three/fiber';

// Handlers compartidos por todos los cuerpos clicables de la escena: cambian
// el cursor a "mano" al pasar por encima sin que el evento atraviese al astro de detrás.
export const hoverCursor = {
  onPointerOver: (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  },
  onPointerOut: () => {
    document.body.style.cursor = 'auto';
  },
};
