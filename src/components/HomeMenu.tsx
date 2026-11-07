import { Compass, Orbit, Camera} from 'lucide-react';
import type { ReactNode } from 'react';
import { ModuleCard } from './ModuleCard';

export type ActiveView = 'solar' | 'exo' | 'citizen';

const MODULES: {
  view: ActiveView;
  icon: ReactNode;
  imageUrl: string;
  title: string;
  description: string;
  cta: string;
}[] = [
  {
    view: 'solar',
    icon: <Orbit size={24} strokeWidth={1.8} />,
    // 👇 FOTO DEL BOTÓN 1 (Simulador del Sistema Solar)
    imageUrl: '/Hello_World.jpg',
    title: 'Simulador del Sistema Solar',
    description:
      'Mapa interactivo 3D en tiempo real conectado a la API de NASA JPL Horizons. Explora planetas, órbitas y satélites.',
    cta: 'Iniciar Simulación →',
  },
  {
    view: 'exo',
    icon: <Compass size={24} strokeWidth={1.8} />,
    // 👇 FOTO DEL BOTÓN 2 (Explorador de Exoplanetas)
    imageUrl: '/Galaxy.jpg',
    title: 'Explorador de Exoplanetas',
    description:
      'Consulta el archivo astrofísico de la NASA para analizar telemetría, habitabilidad y clasificación de otros mundos.',
    cta: 'Abrir Buscador →',
  },
  {
    view: 'citizen',
    icon: <Camera size={24} strokeWidth={1.8} />,
    // 👇 EDITA ESTA LÍNEA PARA PONER LA FOTO DE LA NUEVA OPCIÓN (pon tu archivo en /public y escribe '/tu-foto.jpg')
    imageUrl: '/Telescopio.jpg',
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
        <h1>Space Explorer</h1>
        <p className="subtitle">
          Selecciona un módulo de navegación para comenzar la misión de exploración astrofísica
        </p>
      </div>

      <div className="cards-grid">
        {MODULES.map(({ view, icon, imageUrl, title, description, cta }) => (
          <ModuleCard
            key={view}
            icon={icon}
            imageUrl={imageUrl}
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