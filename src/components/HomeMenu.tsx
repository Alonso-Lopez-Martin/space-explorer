import { ModuleCard } from './ModuleCard';

export type View = 'home' | 'exo' | 'solar';

interface HomeMenuProps {
  onNavigate: (view: Exclude<View, 'home'>) => void;
}

// Las tarjetas se describen como datos y se pintan con un map, en lugar de
// repetir el mismo bloque JSX para cada módulo.
const MODULES: { view: Exclude<View, 'home'>; title: string; subtitle: string; imageUrl: string }[] = [
  { view: 'solar', title: 'Dentro de nuestro Sistema Solar', subtitle: 'Simulador 3D (Horizons JPL)', imageUrl: '/Hello_World.jpg' },
  { view: 'exo', title: 'Fuera de nuestro Sistema Solar', subtitle: 'Explorador de Exoplanetas', imageUrl: '/Galaxy.jpg' },
];

export function HomeMenu({ onNavigate }: HomeMenuProps) {
  return (
    <div className="home-container">
      <h1>Space Explorer</h1>
      <div className="home-grid">
        {MODULES.map(({ view, ...card }) => (
          <ModuleCard key={view} {...card} onSelect={() => onNavigate(view)} />
        ))}
      </div>
    </div>
  );
}
