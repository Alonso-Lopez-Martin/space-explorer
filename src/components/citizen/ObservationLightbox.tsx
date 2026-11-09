import { useEffect, useRef } from 'react';
import type { ApiObservation } from '../../schemas/observationSchema';

interface ObservationLightboxProps {
  observation: ApiObservation;
  onClose: () => void;
}

// Modal accesible para ver la astrofotografía completa:
// - Enfoca el botón de cierre al montarse y restaura el foco previo al desmontarse.
// - Permite cerrar pulsando la tecla Escape o haciendo clic en el fondo oscuro.
export function ObservationLightbox({ observation, onClose }: ObservationLightboxProps) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="obs-lightbox-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      onClick={onClose}
    >
      <div className="obs-lightbox-content" onClick={(e) => e.stopPropagation()}>
        <div className="obs-lightbox-header">
          <div>
            <h4 id="lightbox-title">{observation.title}</h4>
            <p>
              📸 {observation.observerName} {observation.observerSurname} ·{' '}
              {observation.location} ({observation.country})
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="obs-lightbox-close"
            onClick={onClose}
          >
            ✕ Cerrar (Esc)
          </button>
        </div>
        <div className="obs-lightbox-img-container">
          <img
            src={observation.imageDataUrl}
            alt={observation.title}
            className="obs-lightbox-img"
          />
        </div>
        <p className="obs-lightbox-notes">{observation.notes}</p>
      </div>
    </div>
  );
}