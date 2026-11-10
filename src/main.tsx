import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';

// Configuración de caché de TanStack Query v5:
// - staleTime de 30 s: evita peticiones GET duplicadas cuando el usuario alterna rápidamente
//   entre filtros de categorías astronómicas ya visitadas, manteniendo la galería ágil.
// - retry de 1: reintenta una sola vez ante fallos transitorios de red antes de mostrar error.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);