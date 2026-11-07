import { Compass, Orbit, Camera, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { ModuleCard } from './ModuleCard';

export type ActiveView = 'solar' | 'exo' | 'citizen';

const MODULES: {
  view: ActiveView;
  icon: ReactNode;
  title: string;
  description: string;
  cta: string;
}[] = [
  {
    view: 'solar',
    icon: <Orbit size={44} strokeWidth={1.5} />,
    title: 'Simulador del Sistema Solar',
    description:
      'Mapa interactivo 3D en tiempo real conectado a la API de NASA JPL Horizons. Explora planetas, órbitas y satélites.',
    cta: 'Iniciar Simulación →',
  },
  {
    view: 'exo',
    icon: <Compass size={44} strokeWidth={1.5} />,
    title: 'Explorador de Exoplanetas',
    description:
      'Consulta el archivo astrofísico de la NASA para analizar telemetría, habitabilidad y clasificación de otros mundos.',
    cta: 'Abrir Buscador →',
  },
  {
    view: 'citizen',
    icon: <Camera size={44} strokeWidth={1.5} />,
    title: 'Red de Astrofotografía Ciudadana',
    description:
      'Envía tus capturas de eventos astronómicos validadas con Zod y explora la galería de la comunidad sincronizada con TanStack Query.',
    cta: 'Subir y Explorar Fotos →',
  },
];

interface HomeMenuProps {
  onSelect: (view: ActiveView) => void;
}

export function HomeMenu({ onSelect }: HomeMenuProps) {
  return (
    <div className="home-container">
      <div className="home-header">
        <div className="badge">
          <Sparkles size={14} className="search-btn-icon" /> NASA Open APIs & Citizen Science
        </div>
        <h1>Space Explorer</h1>
        <p className="subtitle">
          Selecciona un módulo de navegación para comenzar la misión de exploración astrofísica
        </p>
      </div>

      <div className="cards-grid">
        {MODULES.map(({ view, icon, title, description, cta }) => (
          <ModuleCard
            key={view}
            icon={icon}
            title={title}
            description={description}
            cta={cta}
            onSelect={() => onSelect(view)}
          />
        ))}
      </div>
    </div>
  );
}