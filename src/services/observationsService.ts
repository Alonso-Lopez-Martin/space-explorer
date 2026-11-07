import {
  apiObservationSchema,
  validateObservationsBatch,
  type ApiObservation,
  type ObservationFormValues,
  type ValidatedObservationsBatch,
} from '../schemas/observationSchema';

// Leemos la URL base desde la variable de entorno VITE_API_URL con fallback seguro.
const API_URL: string = import.meta.env.VITE_API_URL || '/api/observations';

export const OBSERVATIONS_QUERY_KEY = ['observations'] as const;

// GET: obtiene todas las capturas y valida cada elemento con `safeParse` (Bonus).
export async function fetchObservations(): Promise<ValidatedObservationsBatch> {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status} al descargar el catálogo de observaciones`);
  }
  const rawJson: unknown = await response.json();
  return validateObservationsBatch(rawJson);
}

// POST: envía una nueva captura ya validada en cliente y verifica la respuesta con Zod.
export async function createObservation(values: ObservationFormValues): Promise<ApiObservation> {
  // Quitamos el booleano `acceptsLicense` antes de guardar el documento en el servidor.
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

// POST de prueba para el BONUS: inyecta deliberadamente un paquete corrupto en el servidor
// saltándose el formulario para demostrar en vivo cómo `safeParse` lo atrapa al refrescar.
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

// DELETE: permite eliminar una observación o limpiar un registro corrupto de la base de datos.
export async function deleteObservation(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`No se pudo eliminar el registro ${id} (HTTP ${response.status})`);
  }
}