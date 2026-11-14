import type { Block, SceneSpec, Slide } from '../types';

/**
 * BEATS (nhịp) — progressive reveal inside one slide, driven by → / Space / click / clicker.
 *   block.beat = k          → the whole block appears at beat k (and replays its own motion)
 *   block.stepwise = true   → list / bento / timeline / flow / table: one item per beat, starting at block.beat ?? 1
 *   slide.sceneBeats[k]     → partial scene state merged in at beat k (cumulative): e.g. { active: 2 }
 *   slide.beats             → explicit total (otherwise computed)
 * Beat 0 = what is visible when the slide opens.
 */
type Stepwise = Block & { stepwise?: boolean; beat?: number };

export function itemCount(b: Block): number {
  switch (b.type) {
    case 'list':
      return b.items.length;
    case 'bento':
      return b.items.length;
    case 'timeline':
      return b.items.length;
    case 'flow':
      return b.steps.length;
    case 'table':
      return b.rows.length;
    default:
      return 1;
  }
}

/** First beat at which item i of a stepwise block appears (0 = immediately). */
export function itemBeat(b: Block, i: number): number {
  const s = b as Stepwise;
  if (!s.stepwise) return 0; // whole-block beats are handled by <BeatGate>
  return (s.beat ?? 1) + i;
}

export function beatCount(slide: Slide): number {
  if (typeof slide.beats === 'number') return slide.beats;
  let max = 0;
  for (const b of slide.blocks ?? []) {
    const s = b as Stepwise;
    if (s.stepwise) max = Math.max(max, (s.beat ?? 1) + itemCount(b) - 1);
    else if (s.beat) max = Math.max(max, s.beat);
  }
  if (slide.sceneBeats?.length) max = Math.max(max, slide.sceneBeats.length - 1);
  for (const a of slide.annotations ?? []) max = Math.max(max, a.beat ?? 0);
  for (const c of slide.connectors ?? []) max = Math.max(max, c.beat ?? 0);
  return max;
}

/** Scene spec at a given beat: base state + cumulative sceneBeats overrides. */
export function sceneAt(slide: Slide, beat: number): SceneSpec {
  if (!slide.sceneBeats?.length) return slide.scene;
  const merged: Record<string, unknown> = { ...((slide.scene as { state?: object }).state ?? {}) };
  for (let k = 0; k <= Math.min(beat, slide.sceneBeats.length - 1); k++) Object.assign(merged, slide.sceneBeats[k] ?? {});
  return { ...slide.scene, state: merged } as SceneSpec;
}
