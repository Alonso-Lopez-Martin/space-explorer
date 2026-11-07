import { useState } from 'react';
import { SolarSystemMap } from './components/solar/SolarSystemMap';
import { ExoplanetExplorer } from './components/ExoplanetExplorer';
import { CitizenSciencePortal } from './components/citizen/CitizenSciencePortal';
import { HomeMenu, type ActiveView } from './components/HomeMenu';
import { ViewShell } from './components/ViewShell';

type ViewMode = 'home' | ActiveView;

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('home');

  if (viewMode === 'home') {
    return <HomeMenu onSelect={setViewMode} />;
  }

  if (viewMode === 'solar') {
    return (
      <ViewShell title="🌌 Simulador del Sistema Solar" onBack={() => setViewMode('home')}>
        <SolarSystemMap />
      </ViewShell>
    );
  }

  if (viewMode === 'citizen') {
    return (
      <ViewShell title="📸 Red de Astrofotografía Ciudadana" onBack={() => setViewMode('home')}>
        <CitizenSciencePortal />
      </ViewShell>
    );
  }

  return (
    <ViewShell title="🪐 Explorador de Exoplanetas" onBack={() => setViewMode('home')}>
      <ExoplanetExplorer />
    </ViewShell>
  );
}

export default App;