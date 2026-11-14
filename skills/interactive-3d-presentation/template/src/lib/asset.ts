/**
 * Asset URL resolver.
 *  1. remote URL → local copy, when `npm run assets:pull` has downloaded it (public/assets/assets-map.json)
 *  2. single-file build (`npm run build:single`) → the file's data: URL, inlined in window.__DECK_ASSETS__
 *  3. "/assets/x" → "<base>assets/x", so a static build also works under a sub-path (GitHub Pages)
 * Every component loads media through asset(url), so a pulled deck works with no internet.
 */
import map from '../../public/assets/assets-map.json';

const M = map as Record<string, string>;
declare global {
  interface Window {
    __DECK_ASSETS__?: Record<string, string>;
  }
}

export function asset(url: string): string {
  if (!url) return url;
  const local = M[url] ?? url;
  const inlined = typeof window !== 'undefined' ? window.__DECK_ASSETS__?.[local] : undefined;
  if (inlined) return inlined;
  if (local.startsWith('/') && !local.startsWith('//')) return import.meta.env.BASE_URL.replace(/\/$/, '') + local;
  return local;
}
