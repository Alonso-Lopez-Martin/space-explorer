import { useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
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

function getCategoryFilterName(category: CategoryFilter): string {
  if (category === 'all') return 'Todas las categorías';
  return CATEGORY_OPTIONS.find((c) => c.value === category)?.label.split(' (')[0] ?? category;
}

export function ObservationGallery() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [inspectedObs, setInspectedObs] = useState<ApiObservation | null>(null);
  const [mutationFeedbackError, setMutationFeedbackError] = useState<string | null>(null);

  const currentQueryKey = observationsQueryKey(selectedCategory);

  // `placeholderData: keepPreviousData` mantiene visibles los datos previos mientras se
  // descarga la nueva categoría, e `isPlaceholderData` nos permite indicar en la UI
  // exactamente qué categoría está cargándose en segundo plano.
  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } = useQuery({
    queryKey: currentQueryKey,
    queryFn: () => fetchObservations(selectedCategory),
    placeholderData: keepPreviousData,
  });

  const isSwitchingCategory = isFetching && isPlaceholderData;

  // El borrado optimista aplica `setQueriesData` sobre el prefijo raíz `['observations']`
  // porque un mismo registro (identificado por `id`) puede estar cacheado simultáneamente
  // en `['observations', 'all']` y en su categoría específica `['observations', categoria]`.
  // Filtrar por `id` en todas las entradas del prefijo mantiene coherentes todas las vistas.
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteObservation(id),
    onMutate: async (deletedId: string) => {
      setMutationFeedbackError(null);
      await queryClient.cancelQueries({ queryKey: OBSERVATIONS_ROOT_KEY });

      const previousSnapshots = queryClient.getQueriesData<ValidatedObservationsBatch>({
        queryKey: OBSERVATIONS_ROOT_KEY,
      });

      queryClient.setQueriesData<ValidatedObservationsBatch>(
        { queryKey: OBSERVATIONS_ROOT_KEY },
        (oldBatch) => {
          if (!oldBatch) return oldBatch;
          return {
            valid: oldBatch.valid.filter((item) => item.id !== deletedId),
            corrupted: oldBatch.corrupted.filter((item) => item.rawId !== deletedId),
          };
        }
      );

      return { previousSnapshots };
    },
    onError: (err, _deletedId, context) => {
      if (context?.previousSnapshots) {
        for (const [key, snapshot] of context.previousSnapshots) {
          queryClient.setQueryData(key, snapshot);
        }
      }
      setMutationFeedbackError(
        err instanceof Error ? err.message : 'No se pudo eliminar el registro.'
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: OBSERVATIONS_ROOT_KEY });
    },
  });

  const injectCorruptMutation = useMutation({
    mutationFn: injectCorruptedObservation,
    onMutate: () => {
      setMutationFeedbackError(null);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: OBSERVATIONS_ROOT_KEY });
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
      <div role="alert" className="estado-mensaje error-box error-retry-row">
        <span>
          ⚠ Error al cargar la galería: {error instanceof Error ? error.message : 'Fallo de red'}
        </span>
        <button type="button" className="recent-clear-btn" onClick={() => refetch()}>
          Reintentar
        </button>
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
            {isFetching && (
              <span role="status" className="obs-fetching-pill">
                {isSwitchingCategory
                  ? `⏳ Cargando «${getCategoryFilterName(selectedCategory)}»...`
                  : 'Actualizando...'}
              </span>
            )}
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

      {mutationFeedbackError && (
        <div role="alert" className="estado-mensaje error-box error-retry-row">
          <span>⚠ {mutationFeedbackError}</span>
          <button
            type="button"
            className="recent-clear-btn"
            onClick={() => setMutationFeedbackError(null)}
          >
            Cerrar aviso
          </button>
        </div>
      )}

      {/* Barra de filtros con indicador visual de qué categoría se está cargando con keepPreviousData */}
      <div className="obs-filter-bar">
        <button
          type="button"
          aria-pressed={selectedCategory === 'all'}
          aria-busy={selectedCategory === 'all' && isSwitchingCategory}
          className={cn(
            'match-btn',
            selectedCategory === 'all' && 'active',
            selectedCategory === 'all' && isSwitchingCategory && 'loading-category'
          )}
          onClick={() => setSelectedCategory('all')}
        >
          {selectedCategory === 'all' && isSwitchingCategory ? '⏳ ' : ''}Todas las categorías
        </button>
        {CATEGORY_OPTIONS.map((cat) => {
          const isActive = selectedCategory === cat.value;
          const isLoadingThisCategory = isActive && isSwitchingCategory;
          return (
            <button
              key={cat.value}
              type="button"
              aria-pressed={isActive}
              aria-busy={isLoadingThisCategory}
              className={cn(
                'match-btn',
                isActive && 'active',
                isLoadingThisCategory && 'loading-category'
              )}
              onClick={() => setSelectedCategory(cat.value)}
            >
              {isLoadingThisCategory ? '⏳ ' : ''}
              {cat.label.split(' (')[0]}
            </button>
          );
        })}
      </div>

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

      {validItems.length === 0 ? (
        <p className="obs-status-box">No hay capturas registradas en esta categoría todavía.</p>
      ) : (
        <div
          className={cn('obs-grid', isSwitchingCategory && 'obs-grid-transitioning')}
          aria-busy={isSwitchingCategory}
        >
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