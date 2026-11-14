/**
 * Theatre.js camera sequences — "directed" 3D moves (fly around a model, sweep over the globe).
 *
 *   slide.camera = { sequence: 'orbit-model', duration: 6 }
 *
 * Authoring (dev only): open http://localhost:5173/?studio#<slide>, the Theatre.js studio appears.
 * Select sheet "<sequence>" → object "Camera", keyframe position/target on the timeline, then
 * Project → Export → save the JSON as src/content/theatre-state.json. Without keyframes the camera
 * simply stays at its resting position, so an unauthored sequence is harmless.
 * @theatre/core is lazy-loaded; the studio is never part of a production build.
 */
import state from '../content/theatre-state.json';

type Vec = { x: number; y: number; z: number };
export interface CameraObj {
  value: { position: Vec; target: Vec };
}
export interface CameraSeq {
  obj: CameraObj;
  play: () => void;
  stop: () => void;
}

let studioReady: Promise<void> | null = null;
const cache = new Map<string, Promise<CameraSeq>>();

export function cameraSequence(name: string, duration = 6): Promise<CameraSeq> {
  if (!cache.has(name)) {
    cache.set(
      name,
      (async () => {
        if (import.meta.env.DEV && new URLSearchParams(location.search).has('studio')) {
          studioReady ??= import('@theatre/studio').then((m) => m.default.initialize());
          await studioReady;
        }
        const { getProject, types } = await import('@theatre/core');
        const hasState = state && Object.keys(state).length > 0;
        const project = getProject('Deck 3D', hasState ? { state } : undefined);
        const sheet = project.sheet(name);
        const n = (v: number) => types.number(v, { nudgeMultiplier: 0.05 });
        const obj = sheet.object(
          'Camera',
          {
            position: types.compound({ x: n(0), y: n(0), z: n(10) }),
            target: types.compound({ x: n(0), y: n(0), z: n(0) }),
          },
          { reconfigure: true },
        ) as unknown as CameraObj;
        await project.ready;
        return {
          obj,
          play: () => {
            sheet.sequence.position = 0;
            void sheet.sequence.play({ range: [0, duration] });
          },
          stop: () => sheet.sequence.pause(),
        };
      })(),
    );
  }
  return cache.get(name)!;
}
