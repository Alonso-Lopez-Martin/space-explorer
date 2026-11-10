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

const categoryValues = [
  'cielo-profundo',
  'sistema-solar',
  'lluvia-meteoros',
  'eclipse-transito',
  'fenomeno-atmosferico',
] as const;
const equipmentValues = ['telescopio', 'camara-dslr', 'smartphone', 'observatorio'] as const;

export type CategoryFilter = 'all' | (typeof categoryValues)[number];

// Etiquetas legibles por campo para mostrar en el resumen accesible de errores del formulario
export const FIELD_LABELS: Record<string, string> = {
  observerName: 'Nombre',
  observerSurname: 'Apellidos',
  email: 'Correo electrónico',
  phone: 'Teléfono de contacto',
  title: 'Título del evento o astro',
  category: 'Categoría astronómica',
  country: 'País',
  location: 'Región / Observatorio',
  capturedAt: 'Fecha y hora local de la toma',
  equipment: 'Equipo óptico',
  exposureSeconds: 'Exposición total (segundos)',
  bortleScale: 'Cielo escala Bortle',
  imageDataUrl: 'Fotografía astronómica',
  notes: 'Notas técnicas',
  acceptsLicense: 'Licencia de uso científico',
};

const PHONE_REGEX = /^\+?[0-9\s-]{7,16}$/;
const DATA_IMAGE_REGEX = /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const PUBLIC_ASSET_IMAGE_REGEX = /^\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)$/i;

function isPastOrPresentLocalDateTime(val: string): boolean {
  const parsed = Date.parse(val);
  if (Number.isNaN(parsed)) return false;
  return parsed <= Date.now() + 60_000;
}

// Los inputs numéricos se registran con `{ valueAsNumber: true }` en RHF (entregando `number` o `NaN`
// si se dejan vacíos), y en el JSON de la API llegan como `number`. `z.number({ error })` rechaza
// tanto `NaN` como tipos no numéricos sin necesidad de encadenar union + pipe.
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
    .regex(PHONE_REGEX, {
      error: 'Formato telefónico no válido (usa dígitos y prefijo opcional, ej. +34 600112233)',
    })
    .or(z.literal('')),
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
    .min(1, { error: 'La fecha y hora local de la captura son obligatorias' })
    .refine(isPastOrPresentLocalDateTime, {
      error: 'La fecha y hora local de la toma deben ser válidas y no estar en el futuro',
    }),
  equipment: z.enum(equipmentValues, {
    error: 'Selecciona el equipo óptico empleado',
  }),
  exposureSeconds: z
    .number({ error: 'Introduce un tiempo de exposición numérico válido' })
    .positive({ error: 'El tiempo de exposición debe ser mayor que 0 segundos' })
    .max(7200, { error: 'Una toma individual no puede exceder 7200 s (2 horas)' }),
  bortleScale: z
    .number({ error: 'Introduce un nivel numérico de escala Bortle (1 a 9)' })
    .int({ error: 'La escala Bortle debe ser un número entero' })
    .min(1, { error: 'El mínimo en la escala Bortle es 1 (cielo extremadamente oscuro)' })
    .max(9, { error: 'El máximo en la escala Bortle es 9 (centro urbano brillante)' }),
  imageDataUrl: z
    .string()
    .trim()
    .min(1, { error: 'Debes adjuntar una fotografía astronómica (JPG, PNG o WebP)' })
    .refine((val) => DATA_IMAGE_REGEX.test(val) || PUBLIC_ASSET_IMAGE_REGEX.test(val), {
      error: 'Formato de imagen no válido: sube un archivo JPG/PNG/WebP en Base64 o elige una muestra oficial',
    }),
  notes: z
    .string()
    .trim()
    .min(15, { error: 'Describe las condiciones de captura con al menos 15 caracteres' })
    .max(500, { error: 'Las notas técnicas no pueden superar los 500 caracteres' }),
};

// Reglas astrofísicas cruzadas compartidas entre el formulario y la validación de la API:
// 1) Un smartphone sin montura ecuatorial no admite más de 60 s de exposición.
// 2) En cielo urbano contaminado (Bortle > 7), cielo profundo exige al menos 30 s de exposición.
function applyAstrophysicalRules<
  T extends z.ZodType<{
    equipment: (typeof equipmentValues)[number];
    exposureSeconds: number;
    category: (typeof categoryValues)[number];
    bortleScale: number;
  }>,
>(schema: T) {
  return schema
    .refine((data) => !(data.equipment === 'smartphone' && data.exposureSeconds > 60), {
      error: 'Un smartphone sin seguimiento ecuatorial no admite exposiciones mayores a 60 s',
      path: ['exposureSeconds'],
    })
    .refine(
      (data) => !(data.category === 'cielo-profundo' && data.bortleScale > 7 && data.exposureSeconds < 30),
      {
        error: 'En cielo urbano (Bortle > 7), un objeto de cielo profundo exige al menos 30 s de integración',
        path: ['exposureSeconds'],
      }
    );
}

// 1) Esquema del formulario de cliente (incluye aceptación de licencia y reglas cruzadas)
export const observationFormSchema = applyAstrophysicalRules(
  z.object({
    ...baseObservationShape,
    acceptsLicense: z.boolean().refine((val) => val === true, {
      error: 'Debes confirmar la autoría y ceder la captura para uso científico',
    }),
  })
);

export type ObservationFormInput = z.input<typeof observationFormSchema>;
export type ObservationFormValues = z.output<typeof observationFormSchema>;

// 2) Esquema para validar cada registro que devuelve la API (también aplica las reglas cruzadas)
export const apiObservationSchema = applyAstrophysicalRules(
  z.object({
    id: z.string(),
    ...baseObservationShape,
  })
);

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