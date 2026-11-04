import { useState, useEffect, useRef } from 'react';

// Hook genérico para persistir estado en localStorage.
// - No escribe en disco si el valor serializado ya coincide con el almacenado.
// - Escucha el evento 'storage' de window dependiendo únicamente de `[key]`.
//   Guardamos `initialValue` en `initialValueRef` para que si alguien pasa un
//   array/objeto literal (ej. `[]`) no se re-suscriba el listener en cada render.
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const initialValueRef = useRef<T>(initialValue);

  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Sincroniza hacia localStorage solo cuando el valor cambia de verdad respecto a lo guardado.
  useEffect(() => {
    try {
      const serialized = JSON.stringify(storedValue);
      if (window.localStorage.getItem(key) !== serialized) {
        window.localStorage.setItem(key, serialized);
      }
    } catch {
      // Si el navegador bloquea localStorage, el estado en memoria sigue funcionando.
    }
  }, [key, storedValue]);

  // Escucha cambios hechos en otras pestañas sobre la misma clave.
  // Depende solo de `[key]` y lee `initialValueRef.current` para no re-suscribir el listener.
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        setStoredValue(
          e.newValue !== null ? (JSON.parse(e.newValue) as T) : initialValueRef.current
        );
      } catch {
        setStoredValue(initialValueRef.current);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setStoredValue];
}