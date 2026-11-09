import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchObservations,
  deleteObservation,
  injectCorruptedObservation,
  OBSERVATIONS_ROOT_KEY,
  observationsQueryKey,
} from '../../services/observationsService';
import {
  CATEGORY_OPTIONS,
  type ApiObservation,
  type CategoryFilter,
  type ValidatedObservationsBatch,
} from '../../schemas/observationSchema';
import { ObservationCard } from './ObservationCard';
import { CorruptedObservationCard } from './CorruptedObservationCard';
import { ObservationLightbox } from './ObservationLightbox';
import { cn } from '../../utils/cn';

export function ObservationGallery() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [inspectedObs, setInspectedObs] = useState<ApiObservation | null>(null);
  const [mutationFeedbackError, setMutationFeedbackError] = useState<string | null>(null);

  const currentQueryKey = observationsQueryKey(selectedCategory);

  // Query con clave parametrizada ['observations', selectedCategory] (U4 sección 10).
  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: currentQueryKey,
    queryFn: () => fetchObservations(selectedCategory),
  });

  // Mutación de borrado con actualización optimista, rollback en onError y estado por ítem.
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteObservation(id),
    onMutate: async (deletedId: string) => {
      setMutationFeedbackError(null);
      await queryClient.cancelQueries({ queryKey: currentQueryKey });
      const previousBatch = queryClient.getQueryData<ValidatedObservationsBatch>(currentQueryKey);

      if (previousBatch) {
        queryClient.setQueryData<ValidatedObservationsBatch>(currentQueryKey, {
          valid: previousBatch.valid.filter((item) => item.id !== deletedId),
          corrupted: previousBatch.corrupted.filter((item) => item.rawId !== deletedId),
        });
      }

      return { previousBatch };
    },
    onError: (err, _deletedId, context) => {
      if (context?.previousBatch) {
        queryClient.setQueryData(currentQueryKey, context.previousBatch);
      }
      setMutationFeedbackError(
        err instanceof Error ? err.message : 'No se pudo eliminar el registro.'
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: OBSERVATIONS_ROOT_KEY });
    },
  });

  const injectCorruptMutation = useMutation({
    mutationFn: injectCorruptedObservation,
    onMutate: () => {
      setMutationFeedbackError(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBSERVATIONS_ROOT_KEY });
    },
    onError: (err) => {
      setMutationFeedbackError(
        err instanceof Error ? err.message : 'Error al inyectar el paquete de prueba.'
      );
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

  return (
    <section className="obs-gallery-section" aria-label="Galería de astrofotografía ciudadana">
      <div className="obs-gallery-toolbar">
        <div>
          <h3>
            🌌 Colección Pública de Astrofotografía ({validItems.length})
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

      {/* Feedback de error para las mutaciones de borrado o inyección */}
      {mutationFeedbackError && (
        <div role="alert" className="estado-mensaje error-box">
          ⚠ {mutationFeedbackError}
        </div>
      )}

      {/* Filtro por categoría conectado a la queryKey ['observations', selectedCategory] */}
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
                isPurgingThis={
                  deleteMutation.isPending && deleteMutation.variables === report.rawId
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Grid de tarjetas válidas con estado de borrado individual por tarjeta */}
      {validItems.length === 0 ? (
        <p className="obs-status-box">No hay capturas registradas en esta categoría todavía.</p>
      ) : (
        <div className="obs-grid">
          {validItems.map((obs) => (
            <ObservationCard
              key={obs.id}
              observation={obs}
              onInspect={setInspectedObs}
              onDelete={(id) => deleteMutation.mutate(id)}
              isDeletingThis={deleteMutation.isPending && deleteMutation.variables === obs.id}
            />
          ))}
        </div>
      )}

      {inspectedObs && (
        <ObservationLightbox
          observation={inspectedObs}
          onClose={() => setInspectedObs(null)}
        />
      )}
    </section>
  );
}