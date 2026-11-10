import { useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  observationFormSchema,
  CATEGORY_OPTIONS,
  EQUIPMENT_OPTIONS,
  FIELD_LABELS,
  type ObservationFormValues,
} from '../../schemas/observationSchema';
import { createObservation, OBSERVATIONS_ROOT_KEY } from '../../services/observationsService';
import { ImageDropzone } from './ImageDropzone';
import { FormField } from './FormField';

const DEFAULT_VALUES: ObservationFormValues = {
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
  const successBannerRef = useRef<HTMLParagraphElement | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, submitCount },
  } = useForm<ObservationFormValues>({
    resolver: zodResolver(observationFormSchema),
    defaultValues: DEFAULT_VALUES,
    shouldFocusError: true,
  });

  const createMutation = useMutation({
    mutationFn: (values: ObservationFormValues) => createObservation(values),
    onSuccess: async () => {
      reset(DEFAULT_VALUES);
      await queryClient.invalidateQueries({ queryKey: OBSERVATIONS_ROOT_KEY });
      requestAnimationFrame(() => {
        successBannerRef.current?.focus();
      });
    },
  });

  const handleFormInteraction = () => {
    if (createMutation.isSuccess || createMutation.isError) {
      createMutation.reset();
    }
  };

  // Permite que al hacer clic en cualquier línea del resumen de errores el foco
  // salte directamente al input correspondiente y haga scroll suave hacia él.
  const focusFieldByKey = (fieldKey: string) => {
    const domId = fieldKey === 'imageDataUrl' ? 'field-imageDataUrl' : fieldKey;
    const element = document.getElementById(domId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setFocus(fieldKey as keyof ObservationFormValues);
  };

  const onValidSubmit = (data: ObservationFormValues) => {
    createMutation.mutate(data);
  };

  const errorEntries = Object.entries(errors);
  const hasValidationErrors = submitCount > 0 && errorEntries.length > 0;

  return (
    <form
      className="astro-form"
      lang="es"
      spellCheck={false}
      onChange={handleFormInteraction}
      onSubmit={handleSubmit(onValidSubmit)}
      noValidate
    >
      <div className="astro-form-header">
        <h3>📡 Registrar Nueva Observación Astronómica</h3>
        <p className="astro-form-lead">
          Aporta tus capturas a la red de ciencia ciudadana. Tu correo y teléfono se validan para
          verificación científica pero <strong>nunca se publican</strong> en la galería abierta.
        </p>
      </div>

      {/* Resumen global de errores interactivo: muestra el nombre del campo y enlaza el foco */}
      {hasValidationErrors && (
        <div role="alert" className="estado-mensaje error-box form-error-summary">
          <strong>⚠ Revisa los {errorEntries.length} campos con errores (clic para ir al campo):</strong>
          <ul className="form-error-summary-list">
            {errorEntries.map(([fieldKey, errObj]) => (
              <li key={fieldKey}>
                <button
                  type="button"
                  className="error-summary-link"
                  onClick={() => focusFieldByKey(fieldKey)}
                >
                  <strong>{FIELD_LABELS[fieldKey] ?? fieldKey}:</strong> {errObj?.message}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <fieldset className="astro-fieldset">
        <legend>1. Identificación del Observador</legend>
        <div className="form-row-2">
          <FormField id="observerName" label="Nombre *" errorMessage={errors.observerName?.message}>
            <input
              id="observerName"
              type="text"
              autoComplete="given-name"
              placeholder="Ej: Elena"
              aria-invalid={Boolean(errors.observerName)}
              aria-describedby={errors.observerName ? 'error-observerName' : undefined}
              {...register('observerName')}
            />
          </FormField>

          <FormField id="observerSurname" label="Apellidos *" errorMessage={errors.observerSurname?.message}>
            <input
              id="observerSurname"
              type="text"
              autoComplete="family-name"
              placeholder="Ej: Vázquez"
              aria-invalid={Boolean(errors.observerSurname)}
              aria-describedby={errors.observerSurname ? 'error-observerSurname' : undefined}
              {...register('observerSurname')}
            />
          </FormField>
        </div>

        <div className="form-row-2">
          <FormField id="email" label="Correo Electrónico Científico (Privado) *" errorMessage={errors.email?.message}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nombre@dominio.es"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'error-email' : undefined}
              {...register('email')}
            />
          </FormField>

          <FormField id="phone" label="Teléfono de Contacto (Opcional · Privado)" errorMessage={errors.phone?.message}>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+34 600 112 233"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'error-phone' : undefined}
              {...register('phone')}
            />
          </FormField>
        </div>
      </fieldset>

      <fieldset className="astro-fieldset">
        <legend>2. Telemetría y Localización del Evento</legend>
        <div className="form-row-2">
          <FormField id="title" label="Título del Evento o Astro *" errorMessage={errors.title?.message}>
            <input
              id="title"
              type="text"
              placeholder="Ej: Oposición de Júpiter desde Gredos"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'error-title' : undefined}
              {...register('title')}
            />
          </FormField>

          <FormField id="category" label="Categoría Astronómica *" errorMessage={errors.category?.message}>
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
          </FormField>
        </div>

        <div className="form-row-3">
          <FormField id="country" label="País *" errorMessage={errors.country?.message}>
            <input
              id="country"
              type="text"
              autoComplete="country-name"
              placeholder="Ej: España"
              aria-invalid={Boolean(errors.country)}
              aria-describedby={errors.country ? 'error-country' : undefined}
              {...register('country')}
            />
          </FormField>

          <FormField id="location" label="Región / Observatorio *" errorMessage={errors.location?.message}>
            <input
              id="location"
              type="text"
              placeholder="Ej: Sierra de Gredos, Ávila"
              aria-invalid={Boolean(errors.location)}
              aria-describedby={errors.location ? 'error-location' : undefined}
              {...register('location')}
            />
          </FormField>

          <FormField id="capturedAt" label="Fecha y Hora Local de la Toma *" errorMessage={errors.capturedAt?.message}>
            <input
              id="capturedAt"
              type="datetime-local"
              aria-invalid={Boolean(errors.capturedAt)}
              aria-describedby={errors.capturedAt ? 'error-capturedAt' : undefined}
              {...register('capturedAt')}
            />
          </FormField>
        </div>

        <div className="form-row-3">
          <FormField id="equipment" label="Equipo Óptico *" errorMessage={errors.equipment?.message}>
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
          </FormField>

          <FormField id="exposureSeconds" label="Exposición Total (segundos) *" errorMessage={errors.exposureSeconds?.message}>
            <input
              id="exposureSeconds"
              type="number"
              min={1}
              max={7200}
              aria-invalid={Boolean(errors.exposureSeconds)}
              aria-describedby={errors.exposureSeconds ? 'error-exposureSeconds' : undefined}
              {...register('exposureSeconds', { valueAsNumber: true })}
            />
          </FormField>

          <FormField id="bortleScale" label="Cielo Escala Bortle (1-9) *" errorMessage={errors.bortleScale?.message}>
            <input
              id="bortleScale"
              type="number"
              min={1}
              max={9}
              aria-invalid={Boolean(errors.bortleScale)}
              aria-describedby={errors.bortleScale ? 'error-bortleScale' : undefined}
              {...register('bortleScale', { valueAsNumber: true })}
            />
          </FormField>
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
              onChange={(val) => {
                handleFormInteraction();
                field.onChange(val);
              }}
              onBlur={field.onBlur}
              inputRef={field.ref}
              errorMessage={errors.imageDataUrl?.message}
            />
          )}
        />

        <FormField id="notes" label="Notas Técnicas (Seeing, filtros, apilado) *" errorMessage={errors.notes?.message}>
          <textarea
            id="notes"
            rows={3}
            placeholder="Describe el equipo empleado, número de tomas apiladas y condiciones atmosféricas..."
            aria-invalid={Boolean(errors.notes)}
            aria-describedby={errors.notes ? 'error-notes' : undefined}
            {...register('notes')}
          />
        </FormField>

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
        <div role="alert" className="estado-mensaje error-box error-retry-row">
          <span>
            ⚠ {createMutation.error instanceof Error ? createMutation.error.message : 'Error al enviar'}
          </span>
          {createMutation.variables && (
            <button
              type="button"
              className="recent-clear-btn"
              disabled={createMutation.isPending}
              onClick={() => {
                if (createMutation.variables) {
                  createMutation.mutate(createMutation.variables);
                }
              }}
            >
              Reintentar envío
            </button>
          )}
        </div>
      )}

      {createMutation.isSuccess && (
        <p ref={successBannerRef} tabIndex={-1} role="status" className="estado-mensaje success-box">
          ✓ ¡Observación validada y registrada! La galería pública se ha sincronizado automáticamente.
        </p>
      )}
    </form>
  );
}