/**
 * Load TypeScript modules of the deck (src/content/index.ts, src/deck/beats.ts…) from Node scripts.
 * Uses a throw-away Vite server in SSR mode with its OWN cache folder and no dependency optimisation:
 * a running `npm run dev` keeps its node_modules/.vite cache untouched (otherwise the browser gets
 * "504 Outdated Optimize Dep" errors while you validate / build the script in another terminal).
 */
import { createServer } from 'vite';

export async function loadModules(...paths) {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
    appType: 'custom',
    logLevel: 'error',
    cacheDir: 'node_modules/.vite-scripts',
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const out = [];
    for (const p of paths) out.push(await server.ssrLoadModule(p));
    return out;
  } finally {
    await server.close();
  }
}
