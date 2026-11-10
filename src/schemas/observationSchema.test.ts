import {
  observationFormSchema,
  validateObservationsBatch,
  type ObservationFormValues,
} from './observationSchema';

// Suite de verificación de contratos Zod: comprueba las reglas cruzadas astrofísicas (.refine)
// y el aislamiento de datos corruptos procedentes del API mediante `safeParse` (Bonus M4).
export function runObservationSchemaVerification(): { passed: number; details: string[] } {
  const details: string[] = [];
  let passed = 0;

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

  // Caso 1: Formulario válido supera todas las reglas
  const validCheck = observationFormSchema.safeParse(baseValidForm);
  if (validCheck.success) {
    passed += 1;
    details.push('OK 1: Captura válida supera observationFormSchema.');
  }

  // Caso 2: Regla cruzada 1 -> Smartphone con exposición > 60 s debe fallar en exposureSeconds
  const smartphoneCheck = observationFormSchema.safeParse({
    ...baseValidForm,
    equipment: 'smartphone',
    exposureSeconds: 95,
  });
  if (
    !smartphoneCheck.success &&
    smartphoneCheck.error.issues.some((i) => i.path.includes('exposureSeconds'))
  ) {
    passed += 1;
    details.push('OK 2: Regla cruzada bloquea smartphone con exposición > 60 s.');
  }

  // Caso 3: Regla cruzada 2 -> Cielo profundo en Bortle > 7 con exposición < 30 s debe fallar
  const urbanDeepSkyCheck = observationFormSchema.safeParse({
    ...baseValidForm,
    category: 'cielo-profundo',
    bortleScale: 8,
    exposureSeconds: 15,
  });
  if (
    !urbanDeepSkyCheck.success &&
    urbanDeepSkyCheck.error.issues.some((i) => i.path.includes('exposureSeconds'))
  ) {
    passed += 1;
    details.push('OK 3: Regla cruzada bloquea cielo profundo urbano (Bortle > 7) con < 30 s.');
  }

  // Caso 4: validateObservationsBatch separa registros válidos de corruptos con safeParse
  const batchResult = validateObservationsBatch([
    { id: 'obs-ok-1', ...baseValidForm },
    {
      id: 'obs-bad-2',
      ...baseValidForm,
      email: 'correo-sin-arroba',
      exposureSeconds: -45,
      bortleScale: 99,
    },
  ]);

  if (batchResult.valid.length === 1 && batchResult.corrupted.length === 1) {
    passed += 1;
    details.push('OK 4: validateObservationsBatch aísla registros corruptos sin romper el lote.');
  }

  return { passed, details };
}