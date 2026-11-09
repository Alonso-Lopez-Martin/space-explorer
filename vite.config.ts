import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

// Plugin ligero de desarrollo para servir y persistir `db.json` en `/api/observations`
// soportando filtrado por query param (?category=...) además de POST y DELETE.
function localObservationsApiPlugin(): Plugin {
  const dbPath = path.resolve(process.cwd(), 'db.json');

  const readDb = (): Record<string, unknown>[] => {
    try {
      const raw = fs.readFileSync(dbPath, 'utf-8');
      return JSON.parse(raw) as Record<string, unknown>[];
    } catch {
      return [];
    }
  };

  const writeDb = (data: Record<string, unknown>[]) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  };

  return {
    name: 'local-observations-api',
    configureServer(server) {
      server.middlewares.use('/api/observations', (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');

        if (req.method === 'GET') {
          const parsedUrl = new URL(req.url ?? '', 'http://localhost');
          const category = parsedUrl.searchParams.get('category');
          const items = readDb();

          const filtered =
            category && category !== 'all'
              ? items.filter((item) => item.category === category)
              : items;

          res.statusCode = 200;
          res.end(JSON.stringify(filtered));
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += String(chunk);
          });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body) as Record<string, unknown>;
              const items = readDb();
              const newItem: Record<string, unknown> = {
                ...payload,
                id: `obs-${Date.now()}`,
              };
              const updated = [newItem, ...items];
              writeDb(updated);
              res.statusCode = 201;
              res.end(JSON.stringify(newItem));
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ message: 'JSON inválido en la petición POST' }));
            }
          });
          return;
        }

        if (req.method === 'DELETE') {
          const cleanPath = (req.url ?? '').split('?')[0];
          const urlParts = cleanPath.split('/').filter(Boolean);
          const targetId = decodeURIComponent(urlParts[0] ?? '');
          const items = readDb();
          const filtered = items.filter((item) => item.id !== targetId);
          writeDb(filtered);
          res.statusCode = 200;
          res.end(JSON.stringify({ deletedId: targetId }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localObservationsApiPlugin()],
  server: {
    proxy: {
      '/api/nasa': {
        target: 'https://exoplanetarchive.ipac.caltech.edu',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/nasa/, ''),
      },
    },
  },
});