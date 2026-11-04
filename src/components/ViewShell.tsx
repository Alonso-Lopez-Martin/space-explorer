import type { ReactNode } from 'react';

interface ViewShellProps {
  title: string;
  onBack: () => void;
  children: ReactNode;
}

// Marco común de las pantallas interiores: título, contenido y botón de volver.
// Antes el título y el pie de navegación estaban copiados en cada vista.
export function ViewShell({ title, onBack, children }: ViewShellProps) {
  return (
    <div className="view-wrapper">
      <h1>{title}</h1>
      {children}
      <div className="navigation-footer">
        <button type="button" className="btn-secondary" onClick={onBack}>← Volver a la Nave</button>
      </div>
    </div>
  );
}
