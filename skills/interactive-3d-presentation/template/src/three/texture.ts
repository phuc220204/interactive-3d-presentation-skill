import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { asset } from '../lib/asset';

const cache = new Map<string, Promise<THREE.Texture>>();

/** Load (and cache) a texture with CORS; resolves null on failure so scenes can draw a placeholder. */
export function useTextureSafe(src?: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!src) return;
    let alive = true;
    if (!cache.has(src)) {
      cache.set(
        src,
        new Promise((res, rej) => {
          const l = new THREE.TextureLoader();
          l.setCrossOrigin('anonymous');
          l.load(
            asset(src),
            (t) => {
              t.colorSpace = THREE.SRGBColorSpace;
              t.anisotropy = 4;
              res(t);
            },
            undefined,
            rej,
          );
        }),
      );
    }
    cache
      .get(src)!
      .then((t) => alive && setTex(t))
      .catch(() => {
        if (!alive) return;
        console.warn('[deck] image failed to load in 3D scene:', src);
        cache.delete(src);
        setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [src]);
  const img = tex?.image as { width: number; height: number } | undefined;
  const aspect = img ? img.width / img.height : 4 / 3;
  return { tex, failed, aspect };
}
