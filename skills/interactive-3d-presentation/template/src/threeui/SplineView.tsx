import { useEffect, useRef } from 'react';
import { asset } from '../lib/asset';

/**
 * Spline scene (spline.design → Export → Code → "Public URL" …/scene.splinecode, or a downloaded
 * .splinecode in public/). For a seamless look, hide the scene background in the Spline editor before exporting
 * (the deck's theme surface then shows through). Uses @splinetool/runtime directly (lazy chunk). Errors → onError → theme surface stays.
 */
export function SplineView({ scene, onError }: { scene: string; onError?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let app: { dispose?: () => void } | null = null;
    let alive = true;
    (async () => {
      try {
        const { Application } = await import('@splinetool/runtime');
        if (!alive || !ref.current) return;
        const a = new Application(ref.current);
        app = a as unknown as { dispose?: () => void };
        await a.load(asset(scene));
      } catch (e) {
        console.warn('[deck] Spline scene failed to load:', scene, e);
        onError?.();
      }
    })();
    return () => {
      alive = false;
      try {
        app?.dispose?.();
      } catch {
        /* ignore */
      }
    };
  }, [scene]); // eslint-disable-line react-hooks/exhaustive-deps
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}
