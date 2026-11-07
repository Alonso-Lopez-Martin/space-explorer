import {
  CATEGORY_OPTIONS,
  EQUIPMENT_OPTIONS,
  type ApiObservation,
} from '../../schemas/observationSchema';

interface ObservationCardProps {
  observation: ApiObservation;
  onDelete: (id: string) => void;
  isDeleting: boolean;
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

// Tarjeta de la galería pública: muestra autor, lugar, fecha, equipo y telemetría,
// pero NUNCA renderiza datos privados como `email` o `phone`.
export function ObservationCard({ observation, onDelete, isDeleting }: ObservationCardProps) {
  return (
    <article className="obs-card">
      <div className="obs-card-image-wrap">
        <img
          src={observation.imageDataUrl}
          alt={observation.title}
          className="obs-card-img"
          loading="lazy"
        />
        <span className="obs-badge">{getCategoryLabel(observation.category)}</span>
      </div>

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
            disabled={isDeleting}
            onClick={() => onDelete(observation.id)}
          >
            Eliminar captura
          </button>
        </div>
      </div>
    </article>
  );
}