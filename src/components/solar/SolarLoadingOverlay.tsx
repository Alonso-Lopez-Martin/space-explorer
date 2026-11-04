// Overlay de carga extraído de SolarSystemMap para mantener el orquestador limpio
// y separar la interfaz de estado de la configuración del Canvas 3D.
export function SolarLoadingOverlay() {
  return (
    <div role="status" className="solar-loading-overlay">
      <h2>Cargando datos de NASA JPL Horizons para crear el mapa interactivo del sistema solar</h2>
    </div>
  );
}