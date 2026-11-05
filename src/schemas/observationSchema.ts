import { z } from 'zod';

export const CATEGORY_OPTIONS = [
  { value: 'cielo-profundo', label: 'Cielo Profundo (Nebulosas / Galaxias)' },
  { value: 'sistema-solar', label: 'Sistema Solar (Planetas / Luna)' },
  { value: 'lluvia-meteoros', label: 'Lluvia de Meteoros (Perseidas / Gemínidas)' },
  { value: 'eclipse-transito', label: 'Eclipse o Tránsito Planetario' },
  { value: 'fenomeno-atmosferico', label: 'Fenómeno Atmosférico (Aurora / Airglow)' },
] as const;

export const EQUIPMENT_OPTIONS = [
  { value: 'telescopio', label: 'Telescopio + Cámara Dedicada' },
  { value: 'camara-dslr', label: 'Cámara DSLR / Mirrorless en Trípode' },
  { value: 'smartphone', label: 'Smartphone con Adaptador Ocular' },
  { value: 'observatorio', label: 'Telescopio Remoto / Observatorio' },
] as const;

const categoryValues = ['cielo-profundo', 'sistema-solar', 'lluvia-meteoros', 'eclipse-transito', 'fenomeno-atmosferico'] as const;
const equipmentValues = ['telescopio', 'camara-dslr', 'smartphone', 'observatorio'] as const;

// Comprueba que la fecha ISO exista de verdad y no esté en el futuro.
function isPastOrPresentIsoDate(val: string): boolean {
  const parsed = Date.parse(val);
  if (Number.isNaN(parsed)) return false;
  return parsed <= Date.now() + 60_000;
}

// Esquema base compartido entre el formulario de envío y la validación de respuesta del API.
// Así garantizamos que el esquema Zod sea la única fuente de verdad de tipos y reglas.
const baseObservationShape = {
  observerName: z
    .string()
    .trim()
    .min(2, { error: 'El nombre debe tener al menos 2 caracteres' })
    .max(50, { error: 'El nombre no puede superar los 50 caracteres' }),
  observerSurname: z
    .string()
    .trim()
    .min(2, { error: 'Los apellidos deben tener al menos 2 caracteres' })
    .max(60, { error: 'Los apellidos no pueden superar los 60 caracteres' }),
  email: z.email({ error: 'Introduce un correo electrónico válido (ej. ada@astro.org)' }),
  phone: z
    .string()
    .trim()
    .refine((val) => val === '' || /^\+?[0-9\s-]{7,16}$/.test(val), {
      error: 'Formato telefónico no válido (usa dígitos y prefijo opcional, ej. +34 600112233)',
    }),
  title: z
    .string()
    .trim()
    .min(5, { error: 'El título de la observación debe tener al menos 5 caracteres' })
    .max(90, { error: 'El título es demasiado largo (máx. 90 caracteres)' }),
  category: z.enum(categoryValues, {
    error: 'Selecciona una categoría astronómica válida',
  }),
  country: z
    .string()
    .trim()
    .min(2, { error: 'Indica el país desde el que se realizó la toma' }),
  location: z
    .string()
    .trim()
    .min(3, { error: 'Especifica la localidad, comarca u observatorio' }),
  capturedAt: z
    .string()
    .min(1, { error: 'La fecha y hora de la captura son obligatorias' })
    .refine(isPastOrPresentIsoDate, {
      error: 'La fecha de la toma debe ser válida y no puede estar en el futuro',
    }),
  equipment: z.enum(equipmentValues, {
    error: 'Selecciona el equipo óptico empleado',
  }),
  // z.coerce.number() convierte el string del input numérico antes de validar (U4 sección 3).
  exposureSeconds: z.coerce
    .number({ error: 'Introduce un tiempo de exposición numérico' })
    .positive({ error: 'El tiempo de exposición debe ser mayor que 0 segundos' })
    .max(7200, { error: 'Una toma individual no puede exceder 7200 s (2 horas)' }),
  bortleScale: z.coerce
    .number({ error: 'Introduce un nivel numérico de escala Bortle (1 a 9)' })
    .int({ error: 'La escala Bortle debe ser un número entero' })
    .min(1, { error: 'El mínimo en la escala Bortle es 1 (cielo extremadamente oscuro)' })
    .max(9, { error: 'El máximo en la escala Bortle es 9 (centro urbano brillante)' }),
  imageDataUrl: z
    .string()
    .min(1, { error: 'Debes adjuntar una fotografía astronómica (JPG, PNG o WebP)' })
    .refine(
      (val) => val.startsWith('data:image/') || val.startsWith('/'),
      { error: 'El archivo adjunto debe ser una imagen válida' }
    ),
  notes: z
    .string()
    .trim()
    .min(15, { error: 'Describe las condiciones de captura con al menos 15 caracteres' })
    .max(500, { error: 'Las notas técnicas no pueden superar los 500 caracteres' }),
};

// 1) Esquema del formulario de cliente: incluye la aceptación de licencia científica
//    y dos validaciones cruzadas (.refine) con sentido astrofísico real.
export const observationFormSchema = z
  .object({
    ...baseObservationShape,
    acceptsLicense: z.literal(true, {
      error: 'Debes confirmar la autoría y ceder la captura para uso científico',
    }),
  })
  .refine(
    (data) => !(data.equipment === 'smartphone' && data.exposureSeconds > 60),
    {
      error: 'Un smartphone sin seguimiento ecuatorial no admite exposiciones mayores a 60 s',
      path: ['exposureSeconds'],
    }
  )
  .refine(
    (data) => !(data.category === 'cielo-profundo' && data.bortleScale > 7 && data.exposureSeconds < 30),
    {
      error: 'En cielo urbano (Bortle > 7), un objeto de cielo profundo exige al menos 30 s de integración',
      path: ['exposureSeconds'],
    }
  );

export type ObservationFormValues = z.infer<typeof observationFormSchema>;

// 2) Esquema para validar cada registro que devuelve la API (incluye `id`).
export const apiObservationSchema = z.object({
  id: z.string(),
  ...baseObservationShape,
});

export type ApiObservation = z.infer<typeof apiObservationSchema>;

export interface CorruptedObservationReport {
  rawId: string;
  rawTitle: string;
  issues: string[];
}

export interface ValidatedObservationsBatch {
  valid: ApiObservation[];
  corrupted: CorruptedObservationReport[];
}

// BONUS U4 (Sección 11): Validación de la respuesta del API con `safeParse`.
// En lugar de confiar ciegamente en el JSON del servidor, validamos cada registro
// con `apiObservationSchema.safeParse`. Los registros válidos pasan a la galería y
// los corruptos se aíslan con la lista exacta de fallos detectados por Zod.
export function validateObservationsBatch(rawJson: unknown): ValidatedObservationsBatch {
  if (!Array.isArray(rawJson)) {
    throw new Error('La respuesta del servidor no es una lista JSON válida.');
  }

  const valid: ApiObservation[] = [];
  const corrupted: CorruptedObservationReport[] = [];

  for (const item of rawJson) {
    const result = apiObservationSchema.safeParse(item);
    if (result.success) {
      valid.push(result.data);
    } else {
      const record = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>;
      corrupted.push({
        rawId: typeof record.id === 'string' ? record.id : 'ID-desconocido',
        rawTitle: typeof record.title === 'string' ? record.title : 'Registro sin título legible',
        issues: result.error.issues.map((iss) => `${iss.path.join('.') || 'raíz'}: ${iss.message}`),
      });
    }
  }

  return { valid, corrupted };
}