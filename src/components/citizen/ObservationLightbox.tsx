import { useEffect, useRef } from 'react';
import type { ApiObservation } from '../../schemas/observationSchema';

interface ObservationLightboxProps {
  observation: ApiObservation;
  onClose: () => void;
}

// Modal accesible con Focus Trap (atrapa el tabulador dentro del diálogo mientras está abierto)
// y cierre mediante tecla Escape o clic en el fondo oscuro.
export function ObservationLightbox({ observation, onClose }: ObservationLightboxProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
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
      <div
        ref={dialogRef}
        className="obs-lightbox-content"
        onClick={(e) => e.stopPropagation()}
      >
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