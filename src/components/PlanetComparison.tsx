import { calculateMetrics, roundTo, type Exoplanet, type PlanetMetrics } from '../utils/astro-calc';
import { PlanetSphere } from './PlanetSphere';

interface PlanetComparisonProps {
  basePlanet: Exoplanet;
  currentPlanet: Exoplanet;
  onClose: () => void;
}

interface ComparisonField {
  label: string;
  getValue: (planet: Exoplanet, metrics: PlanetMetrics) => string | number | null;
}

// Helper único para formatear celdas vacías o nulas sin repetir 'Desconocida' en cada fila.
function formatCell(value: string | number | null): string | number {
  return value !== null && value !== '' ? value : 'Desconocida';
}

// Lista declarativa de campos de la tabla comparativa: añadir o cambiar una fila
// no requiere duplicar ternarios ni lógica de formato.
const COMPARISON_FIELDS: ComparisonField[] = [
  { label: 'Clasificación', getValue: (_p, m) => m.tipoPlaneta },
  { label: 'Habitabilidad', getValue: (_p, m) => m.habitabilidad },
  {
    label: 'Radio (x 🌍)',
    getValue: (p, m) => p.pl_rade ?? `~${roundTo(m.radioBase, 1)}`,
  },
  { label: 'Masa (x 🌍)', getValue: (p) => p.pl_bmasse },
  { label: 'Gravedad (g)', getValue: (_p, m) => roundTo(m.gravedad, 2) },
  { label: 'Densidad (g/cm³)', getValue: (_p, m) => roundTo(m.densidad, 2) },
  { label: 'Temperatura (K)', getValue: (p) => p.pl_eqt },
  { label: 'Distancia (Años Luz)', getValue: (_p, m) => m.distAL },
];

// Comparador cara a cara entre un exoplaneta fijado y el que se visualiza actualmente.
export function PlanetComparison({ basePlanet, currentPlanet, onClose }: PlanetComparisonProps) {
  const baseMetrics = calculateMetrics(basePlanet);
  const currentMetrics = calculateMetrics(currentPlanet);

  const rows = COMPARISON_FIELDS.map((field) => ({
    label: field.label,
    a: formatCell(field.getValue(basePlanet, baseMetrics)),
    b: formatCell(field.getValue(currentPlanet, currentMetrics)),
  }));

  return (
    <section className="comparison-panel" aria-label="Comparador de exoplanetas">
      <div className="comparison-header">
        <h3>🔬 Comparativa directa: {basePlanet.pl_name} vs {currentPlanet.pl_name}</h3>
        <button type="button" className="recent-clear-btn" onClick={onClose}>
          Cerrar comparativa
        </button>
      </div>

      <div className="comparison-spheres">
        <div className="comparison-sphere-card">
          <PlanetSphere sizePx={Math.round(baseMetrics.sizePx * 0.55)} textureUrl={baseMetrics.textura} />
          <strong>{basePlanet.pl_name}</strong>
        </div>
        <div className="comparison-sphere-card">
          <PlanetSphere sizePx={Math.round(currentMetrics.sizePx * 0.55)} textureUrl={currentMetrics.textura} />
          <strong>{currentPlanet.pl_name}</strong>
        </div>
      </div>

      <table className="comparison-table">
        <thead>
          <tr>
            <th>Parámetro</th>
            <th>{basePlanet.pl_name}</th>
            <th>{currentPlanet.pl_name}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td>{row.a}</td>
              <td>{row.b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}