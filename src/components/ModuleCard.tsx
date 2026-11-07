import type { ReactNode } from 'react';

export interface ModuleCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  cta: string;
  onSelect: () => void;
}

export function ModuleCard({ icon, title, description, cta, onSelect }: ModuleCardProps) {
  return (
    <button type="button" className="module-card" onClick={onSelect}>
      <div className="card-icon">{icon}</div>
      <h2>{title}</h2>
      <p>{description}</p>
      <span className="card-cta">{cta}</span>
    </button>
  );
}