import { describe, it, expect } from 'vitest';
import {
  observationFormSchema,
  apiObservationSchema,
  validateObservationsBatch,
  type ObservationFormValues,
} from './observationSchema';

const baseValidForm: ObservationFormValues = {
  observerName: 'Elena',
  observerSurname: 'Vázquez',
  email: 'elena.vazquez@astro.es',
  phone: '+34 611223344',
  title: 'Oposición de Júpiter desde La Palma',
  category: 'sistema-solar',
  country: 'España',
  location: 'Roque de los Muchachos',
  capturedAt: '2026-02-14T23:15',
  equipment: 'telescopio',
  exposureSeconds: 120,
  bortleScale: 2,
  imageDataUrl: '/Jupiter.jpg',
  notes: 'Seeing excelente de 0.8 segundos de arco con cámara planetaria dedicada.',
  acceptsLicense: true,
};

describe('observationSchema · Reglas de formulario y API', () => {
  it('acepta una observación astronómica válida completa y permite teléfono vacío', () => {
    const validResult = observationFormSchema.safeParse({
      ...baseValidForm,
      phone: '',
    });
    expect(validResult.success).toBe(true);
  });

  it('rechaza exposiciones mayores a 60 s cuando el equipo es un smartphone (regla cruzada 1)', () => {
    const result = observationFormSchema.safeParse({
      ...baseValidForm,
      equipment: 'smartphone',
      exposureSeconds: 95,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join('.'));
      expect(paths).toContain('exposureSeconds');
    }
  });

  it('rechaza cielo profundo en cielo urbano (Bortle > 7) con menos de 30 s de exposición (regla cruzada 2)', () => {
    const result = observationFormSchema.safeParse({
      ...baseValidForm,
      category: 'cielo-profundo',
      bortleScale: 8,
      exposureSeconds: 15,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join('.'));
      expect(paths).toContain('exposureSeconds');
    }
  });

  it('aplica también las reglas cruzadas en apiObservationSchema', () => {
    const apiResult = apiObservationSchema.safeParse({
      id: 'obs-test-1',
      ...baseValidForm,
      equipment: 'smartphone',
      exposureSeconds: 180,
    });

    expect(apiResult.success).toBe(false);
  });

  it('validateObservationsBatch separa registros válidos de corruptos con safeParse sin lanzar excepción', () => {
    const batch = validateObservationsBatch([
      { id: 'obs-ok-1', ...baseValidForm },
      {
        id: 'obs-corrupt-2',
        ...baseValidForm,
        email: 'correo-invalido-sin-arroba',
        exposureSeconds: -20,
        bortleScale: 45,
      },
    ]);

    expect(batch.valid).toHaveLength(1);
    expect(batch.valid[0].id).toBe('obs-ok-1');
    expect(batch.corrupted).toHaveLength(1);
    expect(batch.corrupted[0].rawId).toBe('obs-corrupt-2');
    expect(batch.corrupted[0].issues.length).toBeGreaterThanOrEqual(3);
  });
});