import type { CorruptedObservationReport } from '../../schemas/observationSchema';

interface CorruptedObservationCardProps {
  report: CorruptedObservationReport;
  onPurge: (id: string) => void;
  isPurging: boolean;
}

// Componente demostrativo del BONUS (U4 sección 11): enseña qué campos del servidor
// fallaron al pasar por `apiObservationSchema.safeParse`, evitando que rompan la UI.
export function CorruptedObservationCard({
  report,
  onPurge,
  isPurging,
}: CorruptedObservationCardProps) {
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
        <button
          type="button"
          className="recent-clear-btn"
          disabled={isPurging}
          onClick={() => onPurge(report.rawId)}
        >
          Purgar registro corrupto del servidor
        </button>
      </div>
    </article>
  );
}