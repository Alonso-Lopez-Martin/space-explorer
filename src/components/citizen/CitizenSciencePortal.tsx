import { ObservationForm } from './ObservationForm';
import { ObservationGallery } from './ObservationGallery';

// Vista principal de la Misión M4: une el formulario validado (React Hook Form + Zod)
// y la galería sincronizada con el servidor mediante TanStack Query v5.
export function CitizenSciencePortal() {
  return (
    <div className="citizen-portal-layout">
      <ObservationForm />
      <ObservationGallery />
    </div>
  );
}