/**
 * Country outlines for the globe: Natural Earth 1:50m via world-atlas (public domain), decoded with topojson-client.
 * Loaded lazily (own chunk, ~250 KB gzip) only when a globe uses `highlight` / `borders`. Works offline.
 */
import type { LatLon } from '../types';

export interface Country {
  id: string; // ISO 3166-1 numeric, e.g. "704"
  name: string; // Natural Earth English name, e.g. "Vietnam"
  rings: [number, number][][]; // outer rings, [lon, lat]
  bbox: [number, number, number, number]; // minLon, minLat, maxLon, maxLat
  center: LatLon;
}
export interface Atlas {
  countries: Country[];
  /** shared borders + coastlines as polylines of [lon, lat] */
  borders: [number, number][][];
}

let cache: Promise<Atlas> | null = null;

export function loadAtlas(): Promise<Atlas> {
  cache ??= (async () => {
    const [topoMod, tj] = await Promise.all([import('world-atlas/countries-50m.json'), import('topojson-client')]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const topo = ((topoMod as any).default ?? topoMod) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fc = tj.feature(topo, topo.objects.countries) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const countries: Country[] = fc.features.map((f: any) => {
      const polys: [number, number][][][] = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
      const rings = polys.map((p) => p[0]);
      const main = rings.reduce((a, b) => (b.length > a.length ? b : a), rings[0]);
      let minLon = 180, minLat = 90, maxLon = -180, maxLat = -90;
      for (const [lon, lat] of main) {
        minLon = Math.min(minLon, lon); maxLon = Math.max(maxLon, lon);
        minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
      }
      return { id: String(f.id), name: f.properties.name as string, rings, bbox: [minLon, minLat, maxLon, maxLat], center: [(minLat + maxLat) / 2, (minLon + maxLon) / 2] as LatLon };
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mesh = tj.mesh(topo, topo.objects.countries) as any;
    return { countries, borders: mesh.coordinates as [number, number][][] };
  })();
  return cache;
}

const norm = (s: string) => s.trim().toLowerCase();
const ALIAS: Record<string, string> = { 'viet nam': 'vietnam', 'việt nam': 'vietnam', usa: 'united states of america', us: 'united states of america', uk: 'united kingdom', 'south korea': 'south korea', korea: 'south korea', russia: 'russia', laos: 'laos' };

/** Countries by English name (case-insensitive, a few aliases) or ISO numeric id. Unknown names are skipped with a warning. */
export function findCountries(atlas: Atlas, names: string[]): Country[] {
  const out: Country[] = [];
  for (const n of names) {
    const key = ALIAS[norm(n)] ?? norm(n);
    const c = atlas.countries.find((x) => norm(x.name) === key || x.id === n.trim());
    if (c) out.push(c);
    else console.warn(`[deck] globe: country "${n}" not found — use the English Natural Earth name (e.g. "Vietnam", "Thailand") or ISO numeric id`);
  }
  return out;
}

/** Ray casting on a ring of [lon, lat]. */
export function inRing(ring: [number, number][], lon: number, lat: number) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Evenly spaced [lat, lon] samples inside the rings (step in degrees). */
export function fillPoints(rings: [number, number][][], step: number): LatLon[] {
  const pts: LatLon[] = [];
  for (const ring of rings) {
    let minLon = 180, minLat = 90, maxLon = -180, maxLat = -90;
    for (const [lon, lat] of ring) {
      minLon = Math.min(minLon, lon); maxLon = Math.max(maxLon, lon);
      minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
    }
    if (maxLon - minLon > 180) continue; // crosses the antimeridian: skip the fill, the outline is still drawn
    for (let lat = minLat; lat <= maxLat; lat += step) for (let lon = minLon; lon <= maxLon; lon += step / Math.max(0.3, Math.cos((lat * Math.PI) / 180))) if (inRing(ring, lon, lat)) pts.push([lat, lon]);
  }
  return pts;
}
