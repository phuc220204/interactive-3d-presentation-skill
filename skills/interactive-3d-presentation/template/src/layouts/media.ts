import type { Block, Slide } from '../types';

/** Blocks that count as the slide's hero visual (one per slide). */
export const VISUAL_BLOCKS = new Set<Block['type']>(['image', 'gallery', 'video', 'chart', 'diagram', 'lottie', 'waffle', 'gauge', 'dimension', 'simulation']);

/**
 * split / split-right slides whose 3D scene is only 'ambient': the visual block becomes the hero and takes the
 * visual half of the stage (where a 3D scene would sit); the ambient scene is dimmed behind it.
 * Returns the index of that block in slide.blocks, or -1.
 */
export function mediaIndex(slide: Slide): number {
  const layout = slide.layout ?? 'split';
  if (layout !== 'split' && layout !== 'split-right') return -1;
  if (slide.scene && slide.scene.name !== 'ambient') return -1;
  return (slide.blocks ?? []).findIndex((b) => VISUAL_BLOCKS.has(b.type));
}

/** Blocks that already give the eye something to read: the ambient backdrop must stay out of their way. */
const DATA_BLOCKS = new Set<Block['type']>(['table', 'bars', 'metric', 'code', 'math', 'bento', 'compare', 'timeline', 'flow']);

/**
 * True when the slide's scene is only 'ambient' but the slide already carries a visual, a table or figures
 * (or is the references list): the ambient layer is switched off completely so nothing sits behind the content.
 */
export function ambientQuiet(slide: Slide): boolean {
  if (slide.scene && slide.scene.name !== 'ambient') return false;
  if (slide.layout === 'references') return true;
  return (slide.blocks ?? []).some((b) => VISUAL_BLOCKS.has(b.type) || DATA_BLOCKS.has(b.type));
}
