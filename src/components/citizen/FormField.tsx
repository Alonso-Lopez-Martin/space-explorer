import type { ReactNode } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  errorMessage?: string;
  children: ReactNode;
}

// Componente reutilizable para campos de formulario accesibles (U4 sección 4):
// asocia siempre <label htmlFor={id}> con el input hijo y renderiza el error con role="alert".
export function FormField({ id, label, errorMessage, children }: FormFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {errorMessage && (
        <p id={`error-${id}`} role="alert" className="field-error">
          {errorMessage}
        </p>
      )}
    </div>
  );
}