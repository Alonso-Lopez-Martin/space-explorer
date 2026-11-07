import type { ReactNode } from 'react';

export interface ModuleCardProps {
  icon: ReactNode;
  imageUrl: string;
  title: string;
  description: string;
  cta: string;
  onSelect: () => void;
}

export function ModuleCard({ icon, imageUrl, title, description, cta, onSelect }: ModuleCardProps) {
  return (
    <button type="button" className="module-card" onClick={onSelect}>
      <div className="module-card-media">
        <img src={imageUrl} alt={title} className="module-card-img" />
        <div className="card-icon-badge">{icon}</div>
      </div>
      <div className="module-card-content">
        <h2>{title}</h2>
        <p>{description}</p>
        <span className="card-cta">{cta}</span>
      </div>
    </button>
  );
}