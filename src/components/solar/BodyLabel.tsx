import { Html } from '@react-three/drei';
import type { CSSProperties } from 'react';

type LabelVariant = 'sun' | 'planet' | 'moon';

interface BodyLabelProps {
  name: string;
  variant: LabelVariant;
  active?: boolean;
  /** Color de acento del astro (borde y punto del planeta). */
  color?: string;
  /** Altura sobre el centro del astro. */
  height: number;
  onSelect: () => void;
}

const BASE: CSSProperties = { cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' };

function labelStyle({ variant, active, color }: Pick<BodyLabelProps, 'variant' | 'active' | 'color'>): CSSProperties {
  switch (variant) {
    case 'sun':
      return { ...BASE, background: 'rgba(5, 8, 16, 0.75)', border: '1px solid #ffcc00', color: '#ffcc00', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 };
    case 'planet':
      return {
        ...BASE,
        background: active ? 'rgba(0, 210, 255, 0.25)' : 'rgba(5, 8, 16, 0.75)',
        border: `1px solid ${active ? '#00d2ff' : color}`,
        color: '#fff', padding: '4px 10px', borderRadius: '14px', fontSize: '11px', fontWeight: 600,
        letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.6)',
      };
    case 'moon':
      return {
        ...BASE,
        background: active ? 'rgba(255, 204, 0, 0.25)' : 'rgba(5, 8, 16, 0.75)',
        border: active ? '1px solid #ffcc00' : '1px solid rgba(255,255,255,0.3)',
        color: active ? '#ffcc00' : '#ddd', padding: '2px 8px', borderRadius: '10px', fontSize: '11px',
      };
  }
}

// Etiqueta HTML anclada a un astro. Sol, planetas y lunas repetían el mismo
// <Html><button/></Html> copiado tres veces; ahora hay un único componente.
export function BodyLabel({ name, variant, active, color, height, onSelect }: BodyLabelProps) {
  return (
    <Html position={[0, height, 0]} center zIndexRange={variant === 'moon' ? [100, 0] : [90, 0]}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        style={labelStyle({ variant, active, color })}
      >
        {variant === 'planet' && (
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, display: 'inline-block' }} />
        )}
        {name.toUpperCase()}
      </button>
    </Html>
  );
}
