import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchObservations,
  deleteObservation,
  injectCorruptedObservation,
  OBSERVATIONS_QUERY_KEY,
} from '../../services/observationsService';
import { CATEGORY_OPTIONS, type ApiObservation } from '../../schemas/observationSchema';
import { ObservationCard } from './ObservationCard';
import { CorruptedObservationCard } from './CorruptedObservationCard';
import { cn } from '../../utils/cn';

export function ObservationGallery() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inspectedObs, setInspectedObs] = useState<ApiObservation | null>(null);

  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: OBSERVATIONS_QUERY_KEY,
    queryFn: fetchObservations,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteObservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBSERVATIONS_QUERY_KEY });
    },
  });

  const injectCorruptMutation = useMutation({
    mutationFn: injectCorruptedObservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBSERVATIONS_QUERY_KEY });
    },
  });

  if (isPending) {
    return (
      <div role="status" className="obs-status-box">
        Sincronizando galería de astrofotografía ciudadana con el servidor...
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="estado-mensaje error-box">
        ⚠ Error al cargar la galería: {error instanceof Error ? error.message : 'Fallo de red'}
      </div>
    );
  }

  const validItems = data.valid;
  const corruptedItems = data.corrupted;

  const filteredItems =
    selectedCategory === 'all'
      ? validItems
      : validItems.filter((item) => item.category === selectedCategory);

  return (
    <section className="obs-gallery-section" aria-label="Galería de astrofotografía ciudadana">
      <div className="obs-gallery-toolbar">
        <div>
          <h3>
            🌌 Colección Pública de Astrofotografía ({filteredItems.length})
            {isFetching && <span className="obs-fetching-pill">Actualizando...</span>}
          </h3>
          <p className="obs-gallery-subtitle">
            Haz clic sobre cualquier fotografía para verla entera a tamaño completo.
          </p>
        </div>

        <button
          type="button"
          className="btn-secondary compare-pin-btn"
          disabled={injectCorruptMutation.isPending}
          onClick={() => injectCorruptMutation.mutate()}
        >
          {injectCorruptMutation.isPending
            ? 'Inyectando...'
            : '🧪 Simular Dato Corrupto en API (Probar Bonus safeParse)'}
        </button>
      </div>

      {/* Filtro rápido por categoría astronómica en una sola línea horizontal */}
      <div className="obs-filter-bar">
        <button
          type="button"
          aria-pressed={selectedCategory === 'all'}
          className={cn('match-btn', selectedCategory === 'all' && 'active')}
          onClick={() => setSelectedCategory('all')}
        >
          Todas las categorías
        </button>
        {CATEGORY_OPTIONS.map((cat) => {
          const isActive = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              aria-pressed={isActive}
              className={cn('match-btn', isActive && 'active')}
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label.split(' (')[0]}
            </button>
          );
        })}
      </div>

      {/* Demostración en vivo del BONUS: registros corruptos atrapados por Zod safeParse */}
      {corruptedItems.length > 0 && (
        <div className="obs-corrupted-section">
          <div className="obs-corrupted-banner">
            <strong>🛡 Defensa activa con Zod safeParse:</strong> Se han interceptado{' '}
            {corruptedItems.length} registro(s) con datos corruptos procedentes del servidor sin
            romper la aplicación.
          </div>
          <div className="obs-grid">
            {corruptedItems.map((report) => (
              <CorruptedObservationCard
                key={report.rawId}
                report={report}
                onPurge={(id) => deleteMutation.mutate(id)}
                isPurging={deleteMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {/* Grid de tarjetas válidas */}
      {filteredItems.length === 0 ? (
        <p className="obs-status-box">No hay capturas registradas en esta categoría todavía.</p>
      ) : (
        <div className="obs-grid">
          {filteredItems.map((obs) => (
            <ObservationCard
              key={obs.id}
              observation={obs}
              onInspect={setInspectedObs}
              onDelete={(id) => deleteMutation.mutate(id)}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Modal / Lightbox para ver la foto entera sin recortes al hacer clic */}
      {inspectedObs && (
        <div
          className="obs-lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={inspectedObs.title}
          onClick={() => setInspectedObs(null)}
        >
          <div className="obs-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="obs-lightbox-header">
              <div>
                <h4>{inspectedObs.title}</h4>
                <p>
                  📸 {inspectedObs.observerName} {inspectedObs.observerSurname} ·{' '}
                  {inspectedObs.location} ({inspectedObs.country})
                </p>
              </div>
              <button
                type="button"
                className="obs-lightbox-close"
                onClick={() => setInspectedObs(null)}
              >
                ✕ Cerrar
              </button>
            </div>
            <div className="obs-lightbox-img-container">
              <img
                src={inspectedObs.imageDataUrl}
                alt={inspectedObs.title}
                className="obs-lightbox-img"
              />
            </div>
            <p className="obs-lightbox-notes">{inspectedObs.notes}</p>
          </div>
        </div>
      )}
    </section>
  );
}