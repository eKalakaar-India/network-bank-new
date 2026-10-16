import process from 'node:process';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function localApi(env) {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        const match = /^\/api\/(cards|facets)$/.exec(url.pathname);
        if (!match) return next();

        for (const key of ['SHEET_ID', 'SHEET_RANGE']) {
          if (!process.env[key] && env[key]) process.env[key] = env[key];
        }

        try {
          const { default: handler } = await server.ssrLoadModule(`/api/${match[1]}.js`);
          req.query = Object.fromEntries(url.searchParams);
          res.status = (status) => {
            res.statusCode = status;
            return res;
          };
          res.json = (body) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(body));
            return res;
          };
          await handler(req, res);
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss(), localApi(env)],
  };
});