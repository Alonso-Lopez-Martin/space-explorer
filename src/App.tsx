import { useState } from 'react';
import { HomeMenu, type View } from './components/HomeMenu';
import { ViewShell } from './components/ViewShell';
import { ExoplanetExplorer } from './components/ExoplanetExplorer';
import { SolarSystemMap } from './components/solar/SolarSystemMap';
import './index.css';

// App solo decide qué pantalla se ve. La búsqueda, el 3D y el menú viven en sus
// propios componentes.
export default function App() {
  const [view, setView] = useState<View>('home');
  const goHome = () => setView('home');

  switch (view) {
    case 'solar':
      return (
        <ViewShell title="Simulador del Sistema Solar" onBack={goHome}>
          <SolarSystemMap />
        </ViewShell>
      );
    case 'exo':
      return (
        <ViewShell title="🪐 Explorador de Exoplanetas" onBack={goHome}>
          <ExoplanetExplorer />
        </ViewShell>
      );
    default:
      return <HomeMenu onNavigate={setView} />;
  }
}