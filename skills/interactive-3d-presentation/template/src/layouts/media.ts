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
