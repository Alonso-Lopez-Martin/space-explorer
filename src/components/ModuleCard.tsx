interface ModuleCardProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  onSelect: () => void;
}

// Tarjeta de la home. Es un <button> y no un <div onClick>: así recibe foco con
// Tab y se activa con Enter/Espacio sin código extra.
export function ModuleCard({ title, subtitle, imageUrl, onSelect }: ModuleCardProps) {
  return (
    <button type="button" className="module-card" onClick={onSelect}>
      <div className="module-image" style={{ backgroundImage: `url('${imageUrl}')` }} />
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </button>
  );
}
