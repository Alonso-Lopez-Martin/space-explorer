import * as THREE from 'three';
import { fallbackAU, SOLAR_SCALE } from '../data/solarSystem';

export interface JplResult {
  position: THREE.Vector3;
  fromFallback: boolean;
}

// Posición heliocéntrica de un cuerpo (JPL Horizons) en unidades de escena.
// Si la API falla se devuelve una posición circular aproximada para que el
// mapa nunca se quede sin planetas, indicando `fromFallback: true` para poder
// informar al usuario en la interfaz.
// Recibe un AbortSignal: si el componente se desmonta mientras la petición
// sigue viva, se cancela de verdad en lugar de dejarla colgando.
export async function fetchJPLPosition(commandId: string, index: number, signal?: AbortSignal): Promise<JplResult> {
  const dist = fallbackAU[commandId] * SOLAR_SCALE;
  const fallbackAngle = (index * 1.1) + 0.5;
  const fallbackPos = new THREE.Vector3(Math.cos(fallbackAngle) * dist, 0, Math.sin(fallbackAngle) * dist);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const url = `https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND='${commandId}'&OBJ_DATA='NO'&MAKE_EPHEM='YES'&EPHEM_TYPE='VECTORS'&CENTER='500@10'&START_TIME='${today}'&STOP_TIME='${tomorrow}'&STEP_SIZE='1%20d'`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return { position: fallbackPos, fromFallback: true };
    const text = await res.text();
    const soeIndex = text.indexOf('$$SOE');
    const eoeIndex = text.indexOf('$$EOE');

    if (soeIndex !== -1 && eoeIndex !== -1) {
      const dataBlock = text.substring(soeIndex, eoeIndex);
      const xMatch = dataBlock.match(/X\s*=\s*([-0-9.E+]+)/);
      const yMatch = dataBlock.match(/Y\s*=\s*([-0-9.E+]+)/);
      const zMatch = dataBlock.match(/Z\s*=\s*([-0-9.E+]+)/);

      if (xMatch && yMatch && zMatch) {
        return {
          position: new THREE.Vector3(
            parseFloat(xMatch[1]) * SOLAR_SCALE,
            parseFloat(zMatch[1]) * SOLAR_SCALE,
            -parseFloat(yMatch[1]) * SOLAR_SCALE
          ),
          fromFallback: false,
        };
      }
    }
  } catch (err) {
    // Una cancelación no es un fallo de red: se propaga para que quien llama pare el proceso.
    if (signal?.aborted) throw err;
    console.warn(`Fallback orbital usado para ${commandId}`);
  }
  return { position: fallbackPos, fromFallback: true };
}