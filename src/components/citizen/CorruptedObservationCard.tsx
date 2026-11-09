import { useState } from 'react';
import type { CorruptedObservationReport } from '../../schemas/observationSchema';

interface CorruptedObservationCardProps {
  report: CorruptedObservationReport;
  onPurge: (id: string) => void;
  isPurgingThis: boolean;
}

export function CorruptedObservationCard({
  report,
  onPurge,
  isPurgingThis,
}: CorruptedObservationCardProps) {
  const [confirmingPurge, setConfirmingPurge] = useState(false);

  return (
    <article className="obs-card obs-card-corrupted" role="alert">
      <div className="obs-corrupted-header">
        <span className="obs-corrupted-badge">🛡 INTERCEPTADO POR ZOD SAFEPARSE</span>
        <code className="obs-corrupted-id">ID: {report.rawId}</code>
      </div>

      <h4 className="obs-card-title">{report.rawTitle}</h4>
      <p className="obs-corrupted-desc">
        Este registro procedente del API incumple el contrato del esquema Zod y ha sido bloqueado
        antes de renderizar datos corruptos:
      </p>

      <ul className="obs-corrupted-list">
        {report.issues.map((issue) => (
          <li key={issue}>{issue}</li>
        ))}
      </ul>

      <div className="obs-card-footer">
        {confirmingPurge ? (
          <div className="obs-confirm-group" role="group" aria-label="Confirmar purga">
            <span className="obs-confirm-text">¿Purgar del servidor?</span>
            <button
              type="button"
              className="recent-clear-btn obs-confirm-danger"
              disabled={isPurgingThis}
              onClick={() => {
                setConfirmingPurge(false);
                onPurge(report.rawId);
              }}
            >
              {isPurgingThis ? 'Purgando...' : 'Sí, purgar'}
            </button>
            <button
              type="button"
              className="recent-clear-btn"
              disabled={isPurgingThis}
              onClick={() => setConfirmingPurge(false)}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="recent-clear-btn"
            disabled={isPurgingThis}
            onClick={() => setConfirmingPurge(true)}
          >
            {isPurgingThis ? 'Purgando...' : 'Purgar registro corrupto'}
          </button>
        )}
      </div>
    </article>
  );
}