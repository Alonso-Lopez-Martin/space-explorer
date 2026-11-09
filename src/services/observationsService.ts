import {
  apiObservationSchema,
  validateObservationsBatch,
  type ApiObservation,
  type CategoryFilter,
  type ObservationFormValues,
  type ValidatedObservationsBatch,
} from '../schemas/observationSchema';

const API_URL: string = import.meta.env.VITE_API_URL || '/api/observations';

// Clave raíz para invalidar todas las listas de observaciones y función generadora
// de claves parametrizadas por categoría: ['observations', category] (U4 sección 10).
export const OBSERVATIONS_ROOT_KEY = ['observations'] as const;
export const observationsQueryKey = (category: CategoryFilter = 'all') =>
  [...OBSERVATIONS_ROOT_KEY, category] as const;

// GET: obtiene las capturas filtradas por categoría en el servidor y las valida con `safeParse`.
export async function fetchObservations(
  category: CategoryFilter = 'all'
): Promise<ValidatedObservationsBatch> {
  const query = category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
  const response = await fetch(`${API_URL}${query}`);
  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status} al descargar el catálogo de observaciones`);
  }
  const rawJson: unknown = await response.json();
  return validateObservationsBatch(rawJson);
}

// POST: envía una nueva captura ya validada en cliente y verifica la respuesta con Zod.
export async function createObservation(values: ObservationFormValues): Promise<ApiObservation> {
  const { acceptsLicense: _license, ...payload } = values;
  void _license;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`No se pudo registrar la observación (HTTP ${response.status})`);
  }

  const createdJson: unknown = await response.json();
  const parsed = apiObservationSchema.safeParse(createdJson);
  if (!parsed.success) {
    throw new Error('El servidor devolvió un registro recién creado con formato inválido.');
  }
  return parsed.data;
}

// POST de prueba para el BONUS: inyecta deliberadamente un paquete corrupto en el servidor.
export async function injectCorruptedObservation(): Promise<void> {
  const corruptedPayload = {
    observerName: 'Satélite',
    observerSurname: 'Descalibrado',
    email: 'telemetria-rota-sin-arroba',
    phone: '',
    title: 'Paquete corrupto inyectado en vivo (Prueba Bonus)',
    category: 'cielo-profundo',
    country: 'Espacio Exterior',
    location: 'Punto de Lagrange L2',
    capturedAt: 'fecha-imposible-9999',
    equipment: 'observatorio',
    exposureSeconds: -999,
    bortleScale: 42,
    imageDataUrl: '/Pluto.jpg',
    notes: 'Inyectado manualmente para demostrar la defensa con Zod safeParse.',
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corruptedPayload),
  });

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status} al inyectar el registro corrupto`);
  }
}

// DELETE: elimina una observación o purga un registro corrupto de la base de datos.
export async function deleteObservation(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`No se pudo eliminar el registro ${id} (HTTP ${response.status})`);
  }
}