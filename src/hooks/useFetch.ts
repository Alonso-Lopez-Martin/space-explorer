import { useEffect, useState } from 'react';

interface Settled<T> {
  key: string;
  data: T | null;
  error: string | null;
}

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

// Hook genérico de lectura JSON.
// - `url === null` significa "no pedir nada": no hay petición y data vuelve a null.
// - `parse` valida/transforma el JSON; debe tener identidad estable (función de
//   módulo) porque forma parte de las dependencias del efecto.
// - `loading` NO se guarda en estado: se deriva comparando la clave de la
//   petición actual (`${reloads}:${url}`) con la de la última respuesta recibida.
// - El efecto depende directamente de `[url, reloads, parse]` sin cortar strings
//   con indexOf(':'), de forma que las dependencias son 100% explícitas y legibles.
export function useFetch<T>(url: string | null, parse: (json: unknown) => T): FetchState<T> {
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const [reloads, setReloads] = useState(0);

  const currentKey = url === null ? null : `${reloads}:${url}`;

  useEffect(() => {
    if (url === null) return;

    const requestKey = `${reloads}:${url}`;
    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const rawJson: unknown = await response.json();
        if (controller.signal.aborted) return;
        const data = parse(rawJson);
        if (controller.signal.aborted) return;
        setSettled({ key: requestKey, data, error: null });
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        setSettled({
          key: requestKey,
          data: null,
          error: err instanceof Error ? err.message : 'Error desconocido',
        });
      }
    })();

    return () => controller.abort();
  }, [url, reloads, parse]);

  // Solo cuenta la respuesta que corresponde a la petición actual; una anterior ya es obsoleta.
  const current = settled !== null && settled.key === currentKey ? settled : null;

  return {
    data: current?.data ?? null,
    loading: currentKey !== null && current === null,
    error: current?.error ?? null,
    reload: () => setReloads((n) => n + 1),
  };
}