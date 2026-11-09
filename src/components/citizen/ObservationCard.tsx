import { useState } from 'react';
import {
  CATEGORY_OPTIONS,
  EQUIPMENT_OPTIONS,
  type ApiObservation,
} from '../../schemas/observationSchema';

interface ObservationCardProps {
  observation: ApiObservation;
  onInspect: (observation: ApiObservation) => void;
  onDelete: (id: string) => void;
  isDeletingThis: boolean;
}

function getCategoryLabel(value: ApiObservation['category']): string {
  return CATEGORY_OPTIONS.find((c) => c.value === value)?.label.split(' (')[0] ?? value;
}

function getEquipmentLabel(value: ApiObservation['equipment']): string {
  return EQUIPMENT_OPTIONS.find((e) => e.value === value)?.label ?? value;
}

function formatCaptureDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ObservationCard({
  observation,
  onInspect,
  onDelete,
  isDeletingThis,
}: ObservationCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <article className="obs-card">
      <button
        type="button"
        className="obs-card-image-btn"
        onClick={() => onInspect(observation)}
        aria-label={`Ver fotografía completa: ${observation.title}`}
      >
        <img
          src={observation.imageDataUrl}
          alt={observation.title}
          className="obs-card-img"
          loading="lazy"
        />
        <span className="obs-badge">{getCategoryLabel(observation.category)}</span>
        <span className="obs-zoom-hint">🔍 Clic para ver foto completa</span>
      </button>

      <div className="obs-card-body">
        <h4 className="obs-card-title">{observation.title}</h4>
        <p className="obs-card-author">
          📸 Por <strong>{observation.observerName} {observation.observerSurname}</strong> ·{' '}
          {observation.location} ({observation.country})
        </p>

        <div className="obs-telemetry-chips">
          <span className="obs-chip">🕒 {formatCaptureDate(observation.capturedAt)}</span>
          <span className="obs-chip">🔭 {getEquipmentLabel(observation.equipment)}</span>
          <span className="obs-chip">⏱ {observation.exposureSeconds} s</span>
          <span className="obs-chip">🌌 Bortle {observation.bortleScale}</span>
        </div>

        <p className="obs-card-notes">{observation.notes}</p>

        <div className="obs-card-footer">
          <button
            type="button"
            className="recent-clear-btn"
            onClick={() => onInspect(observation)}
          >
            Ampliar imagen
          </button>

          {confirmingDelete ? (
            <div className="obs-confirm-group" role="group" aria-label="Confirmar borrado">
              <span className="obs-confirm-text">¿Borrar?</span>
              <button
                type="button"
                className="recent-clear-btn obs-confirm-danger"
                disabled={isDeletingThis}
                onClick={() => {
                  setConfirmingDelete(false);
                  onDelete(observation.id);
                }}
              >
                {isDeletingThis ? 'Borrando...' : 'Sí, borrar'}
              </button>
              <button
                type="button"
                className="recent-clear-btn"
                disabled={isDeletingThis}
                onClick={() => setConfirmingDelete(false)}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="recent-clear-btn"
              disabled={isDeletingThis}
              onClick={() => setConfirmingDelete(true)}
            >
              {isDeletingThis ? 'Borrando...' : 'Eliminar captura'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}