import type { ComponentType } from 'react';
import type { SceneName, SceneSpec } from '../types';
import { Ambient } from './scenes/Ambient';
import { Globe } from './scenes/Globe';
import { Towers } from './scenes/Towers';
import { Morph } from './scenes/Morph';
import { Network } from './scenes/Network';
import { FlowPipeline } from './scenes/FlowPipeline';
import { TimelineHelix } from './scenes/TimelineHelix';
import { Cards } from './scenes/Cards';
import { GalleryScene } from './scenes/GalleryScene';
import { Parallax } from './scenes/Parallax';
import { Model } from './scenes/Model';
import { Plot } from './scenes/Plot';
import { Gear } from './scenes/Gear';

/**
 * Scene registry. To add a scene:
 *   1. add its spec to `SceneSpec` in types.ts (name + state)
 *   2. create three/scenes/MyScene.tsx  → export function MyScene({ spec, active })
 *      - size it to fit a radius of ~2 world units, centred on the origin
 *      - use transparent materials (fade is applied automatically) or a `uFade` uniform
 *      - pin text with <Label> from ../fade
 *   3. register it here.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SCENES: Record<SceneName, ComponentType<{ spec: any; active: boolean }>> = {
  // ThreeUI effects render in a DOM layer (src/threeui/ThreeUIDirector); the R3F stage stays empty so
  // the previous scene fades out and only the theme surface remains underneath.
  threeui: () => null,
  spline: () => null,
  ambient: Ambient,
  globe: Globe,
  towers: Towers,
  morph: Morph,
  network: Network,
  flow: FlowPipeline,
  timeline: TimelineHelix,
  cards: Cards,
  gallery: GalleryScene,
  parallax: Parallax,
  model: Model,
  plot: Plot,
  gear: Gear,
};

export type { SceneSpec };
