import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  observationFormSchema,
  CATEGORY_OPTIONS,
  EQUIPMENT_OPTIONS,
  type ObservationFormInput,
  type ObservationFormValues,
} from '../../schemas/observationSchema';
import { createObservation, OBSERVATIONS_ROOT_KEY } from '../../services/observationsService';
import { ImageDropzone } from './ImageDropzone';

// Tipado con ObservationFormInput (z.input<typeof observationFormSchema>):
// acepta `acceptsLicense: false` como boolean puro sin ningún cast artificial.
const DEFAULT_VALUES: ObservationFormInput = {
  observerName: '',
  observerSurname: '',
  email: '',
  phone: '',
  title: '',
  category: 'sistema-solar',
  country: 'España',
  location: '',
  capturedAt: new Date(Date.now() - 3600_000).toISOString().slice(0, 16),
  equipment: 'telescopio',
  exposureSeconds: 60,
  bortleScale: 3,
  imageDataUrl: '',
  notes: '',
  acceptsLicense: false,
};

export function ObservationForm() {
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ObservationFormInput, unknown, ObservationFormValues>({
    resolver: zodResolver(observationFormSchema),
    defaultValues: DEFAULT_VALUES,
    shouldFocusError: true,
  });

  const createMutation = useMutation({
    mutationFn: (values: ObservationFormValues) => createObservation(values),
    onSuccess: () => {
      reset(DEFAULT_VALUES);
      queryClient.invalidateQueries({ queryKey: OBSERVATIONS_ROOT_KEY });
    },
  });

  const onValidSubmit = (data: ObservationFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <form className="astro-form" onSubmit={handleSubmit(onValidSubmit)} noValidate>
      <div className="astro-form-header">
        <h3>📡 Registrar Nueva Observación Astronómica</h3>
        <p className="astro-form-lead">
          Aporta tus capturas a la red de ciencia ciudadana. Tu correo y teléfono se validan para
          verificación científica pero <strong>nunca se publican</strong> en la galería abierta.
        </p>
      </div>

      <fieldset className="astro-fieldset">
        <legend>1. Identificación del Observador</legend>
        <div className="form-row-2">
          <div className="form-field">
            <label htmlFor="observerName">Nombre *</label>
            <input
              id="observerName"
              type="text"
              autoComplete="given-name"
              placeholder="Ej: Elena"
              aria-invalid={Boolean(errors.observerName)}
              aria-describedby={errors.observerName ? 'error-observerName' : undefined}
              {...register('observerName')}
            />
            {errors.observerName && (
              <p id="error-observerName" role="alert" className="field-error">
                {errors.observerName.message}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="observerSurname">Apellidos *</label>
            <input
              id="observerSurname"
              type="text"
              autoComplete="family-name"
              placeholder="Ej: Vázquez"
              aria-invalid={Boolean(errors.observerSurname)}
              aria-describedby={errors.observerSurname ? 'error-observerSurname' : undefined}
              {...register('observerSurname')}
            />
            {errors.observerSurname && (
              <p id="error-observerSurname" role="alert" className="field-error">
                {errors.observerSurname.message}
              </p>
            )}
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-field">
            <label htmlFor="email">Correo Electrónico Científico (Privado) *</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nombre@dominio.es"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'error-email' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <p id="error-email" role="alert" className="field-error">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="phone">Teléfono de Contacto (Opcional · Privado)</label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+34 600 112 233"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'error-phone' : undefined}
              {...register('phone')}
            />
            {errors.phone && (
              <p id="error-phone" role="alert" className="field-error">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="astro-fieldset">
        <legend>2. Telemetría y Localización del Evento</legend>
        <div className="form-row-2">
          <div className="form-field">
            <label htmlFor="title">Título del Evento o Astro *</label>
            <input
              id="title"
              type="text"
              placeholder="Ej: Oposición de Júpiter desde Gredos"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'error-title' : undefined}
              {...register('title')}
            />
            {errors.title && (
              <p id="error-title" role="alert" className="field-error">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="category">Categoría Astronómica *</label>
            <select
              id="category"
              aria-invalid={Boolean(errors.category)}
              aria-describedby={errors.category ? 'error-category' : undefined}
              {...register('category')}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p id="error-category" role="alert" className="field-error">
                {errors.category.message}
              </p>
            )}
          </div>
        </div>

        <div className="form-row-3">
          <div className="form-field">
            <label htmlFor="country">País *</label>
            <input
              id="country"
              type="text"
              autoComplete="country-name"
              placeholder="Ej: España"
              aria-invalid={Boolean(errors.country)}
              aria-describedby={errors.country ? 'error-country' : undefined}
              {...register('country')}
            />
            {errors.country && (
              <p id="error-country" role="alert" className="field-error">
                {errors.country.message}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="location">Región / Observatorio *</label>
            <input
              id="location"
              type="text"
              placeholder="Ej: Sierra de Gredos, Ávila"
              aria-invalid={Boolean(errors.location)}
              aria-describedby={errors.location ? 'error-location' : undefined}
              {...register('location')}
            />
            {errors.location && (
              <p id="error-location" role="alert" className="field-error">
                {errors.location.message}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="capturedAt">Fecha y Hora de la Toma (UTC) *</label>
            <input
              id="capturedAt"
              type="datetime-local"
              aria-invalid={Boolean(errors.capturedAt)}
              aria-describedby={errors.capturedAt ? 'error-capturedAt' : undefined}
              {...register('capturedAt')}
            />
            {errors.capturedAt && (
              <p id="error-capturedAt" role="alert" className="field-error">
                {errors.capturedAt.message}
              </p>
            )}
          </div>
        </div>

        <div className="form-row-3">
          <div className="form-field">
            <label htmlFor="equipment">Equipo Óptico *</label>
            <select
              id="equipment"
              aria-invalid={Boolean(errors.equipment)}
              aria-describedby={errors.equipment ? 'error-equipment' : undefined}
              {...register('equipment')}
            >
              {EQUIPMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.equipment && (
              <p id="error-equipment" role="alert" className="field-error">
                {errors.equipment.message}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="exposureSeconds">Exposición Total (segundos) *</label>
            <input
              id="exposureSeconds"
              type="number"
              min={1}
              max={7200}
              aria-invalid={Boolean(errors.exposureSeconds)}
              aria-describedby={errors.exposureSeconds ? 'error-exposureSeconds' : undefined}
              {...register('exposureSeconds')}
            />
            {errors.exposureSeconds && (
              <p id="error-exposureSeconds" role="alert" className="field-error">
                {errors.exposureSeconds.message}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="bortleScale">Cielo Escala Bortle (1-9) *</label>
            <input
              id="bortleScale"
              type="number"
              min={1}
              max={9}
              aria-invalid={Boolean(errors.bortleScale)}
              aria-describedby={errors.bortleScale ? 'error-bortleScale' : undefined}
              {...register('bortleScale')}
            />
            {errors.bortleScale && (
              <p id="error-bortleScale" role="alert" className="field-error">
                {errors.bortleScale.message}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="astro-fieldset">
        <legend>3. Archivo Fotográfico y Notas de Campo</legend>

        <Controller
          name="imageDataUrl"
          control={control}
          render={({ field }) => (
            <ImageDropzone
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              errorMessage={errors.imageDataUrl?.message}
            />
          )}
        />

        <div className="form-field">
          <label htmlFor="notes">Notas Técnicas (Seeing, filtros, apilado) *</label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Describe el equipo empleado, número de tomas apiladas y condiciones atmosféricas..."
            aria-invalid={Boolean(errors.notes)}
            aria-describedby={errors.notes ? 'error-notes' : undefined}
            {...register('notes')}
          />
          {errors.notes && (
            <p id="error-notes" role="alert" className="field-error">
              {errors.notes.message}
            </p>
          )}
        </div>

        <div className="form-checkbox-row">
          <label htmlFor="acceptsLicense" className="checkbox-label">
            <input
              id="acceptsLicense"
              type="checkbox"
              aria-invalid={Boolean(errors.acceptsLicense)}
              aria-describedby={errors.acceptsLicense ? 'error-acceptsLicense' : undefined}
              {...register('acceptsLicense')}
            />
            <span>
              Confirmo que soy el autor real de la toma y autorizo su inclusión bajo licencia abierta
              en el archivo ciudadano. *
            </span>
          </label>
          {errors.acceptsLicense && (
            <p id="error-acceptsLicense" role="alert" className="field-error">
              {errors.acceptsLicense.message}
            </p>
          )}
        </div>
      </fieldset>

      <div className="astro-form-actions">
        <button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Transmitiendo telemetría...' : 'Publicar en el Archivo Ciudadano'}
        </button>
      </div>

      {createMutation.isError && (
        <p role="alert" className="estado-mensaje error-box">
          ⚠ {createMutation.error instanceof Error ? createMutation.error.message : 'Error al enviar'}
        </p>
      )}

      {createMutation.isSuccess && (
        <p role="status" className="estado-mensaje success-box">
          ✓ ¡Observación validada y registrada! La galería pública se ha sincronizado automáticamente.
        </p>
      )}
    </form>
  );
}