/**
 * ThreeUI integration — curated catalog of ThreeUI Community effects (MIT, github.com/MengTo/threeui)
 * that work as slide atmosphere / concept visuals inside this deck.
 *
 * Every entry is lazy-loaded from its own subpath → its own chunk (ThreeUI bundles three r128/r165
 * separately from our R3F stack; nothing loads unless a slide uses it).
 *
 * `light`:
 *   'native' → component has mode="light"; rendered natively and multiplied onto the paper
 *   'invert' → dark-only effect; inverted (+hue 180°) and multiplied so it reads as ink on light themes
 * On dark themes every effect is blended with `screen`, so its black backdrop disappears into the theme.
 *
 * To add one: find it at https://threeui.com (or the ThreeUI MCP `search_catalog`), add an entry,
 * run `npm run dev` → /?threeui=<Name> to probe it in light + dark (?theme=whiteboard), keep it only if it reads well.
 */
import type { ComponentType } from 'react';

export type ThreeUIRole = 'background' | 'visual';
export interface ThreeUIEntry {
  /** What it looks like / when to use it — read by AI agents choosing effects. */
  use: string;
  role: ThreeUIRole;
  light: 'native' | 'invert';
  /** Props the component accepts besides mode (hue/saturation/brightness/opacity/speed…) */
  props?: Record<string, unknown>;
  load: () => Promise<ComponentType<Record<string, unknown>>>;
}

type Mod = Record<string, unknown>;
const pick = (name: string) => (m: Mod) => m[name] as ComponentType<Record<string, unknown>>;

export const THREEUI: Record<string, ThreeUIEntry> = {
  // ---------- atmospheric backgrounds ----------
  DotMatrixBackground: {
    use: 'Pulsing dot grid. Tech, data, digital transformation, systems.',
    role: 'background', light: 'invert', props: { opacity: 0.5 },
    load: () => import('@designcodeio/threeui/components/DotMatrixBackground').then(pick('DotMatrixBackground')),
  },
  RibbonFieldBackground: {
    use: 'Flowing silk ribbons. Elegant openers, culture, finance, transitions between sections.',
    role: 'background', light: 'invert',
    load: () => import('@designcodeio/threeui/components/RibbonFieldBackground').then(pick('RibbonFieldBackground')),
  },
  StreamConvergenceBackground: {
    use: 'Streams converging to a point. Integration, convergence, policy unifying actors.',
    role: 'background', light: 'invert',
    load: () => import('@designcodeio/threeui/components/StreamConvergenceBackground').then(pick('StreamConvergenceBackground')),
  },
  EmeraldHorizonBackground: {
    use: 'Rolling luminous horizon. Vision, future, sustainability, closing slides.',
    role: 'background', light: 'invert',
    load: () => import('@designcodeio/threeui/components/EmeraldHorizonBackground').then(pick('EmeraldHorizonBackground')),
  },
  WarpFieldBackground: {
    use: 'Hyperspace warp. Speed, acceleration, disruption, “the turning point”.',
    role: 'background', light: 'invert',
    load: () => import('@designcodeio/threeui/components/WarpFieldBackground').then(pick('WarpFieldBackground')),
  },
  FlowField: {
    use: 'Particle flow field. Markets, movement of capital/goods, dynamics.',
    role: 'background', light: 'invert',
    load: () => import('@designcodeio/threeui/components/FlowField').then(pick('FlowField')),
  },
  TopoField: {
    use: 'Topographic contour lines. Geography, terrain, layered structure, research.',
    role: 'background', light: 'native',
    load: () => import('@designcodeio/threeui/components/TopoField').then(pick('TopoField')),
  },
  ParticleDrift: {
    use: 'Slow drifting particles. Calm text-heavy slides, quotes, reflection.',
    role: 'background', light: 'native',
    load: () => import('@designcodeio/threeui/components/ParticleDrift').then(pick('ParticleDrift')),
  },
  ConstellationField: {
    use: 'Star constellations. Ideas connecting, knowledge, education, space.',
    role: 'background', light: 'native',
    load: () => import('@designcodeio/threeui/components/ConstellationField').then(pick('ConstellationField')),
  },
  NebulaBackground: {
    use: 'Soft nebula clouds. Cinematic opener, big picture, abstraction.',
    role: 'background', light: 'invert',
    load: () => import('@designcodeio/threeui/components/NebulaBackground').then(pick('NebulaBackground')),
  },
  // ---------- concept visuals (placed in the layout's 3D region) ----------
  ParticleNetwork: {
    use: 'Connected particle network. Stakeholders, networks, social/economic links.',
    role: 'visual', light: 'native',
    load: () => import('@designcodeio/threeui/components/ParticleNetwork').then(pick('ParticleNetwork')),
  },
  ConnectivityGraph: {
    use: 'Graph of connected nodes. Infrastructure, connectivity, platforms, integration.',
    role: 'visual', light: 'native',
    load: () => import('@designcodeio/threeui/components/ConnectivityGraph').then(pick('ConnectivityGraph')),
  },
  WireframeForms: {
    use: 'Rotating wireframe solids. Structure, frameworks, models, theory.',
    role: 'visual', light: 'native',
    load: () => import('@designcodeio/threeui/components/WireframeForms').then(pick('WireframeForms')),
  },
  GlobeCollection: {
    use: 'Glowing energy orb with smoke + stars. Energy, core idea, hero visual (no data).',
    role: 'visual', light: 'invert',
    load: () => import('@designcodeio/threeui/components/GlobeCollection').then(pick('GlobeCollection')),
  },
  OrbitalSphereBackground: {
    use: 'Particle sphere with orbits. Global system, ecosystem, central actor.',
    role: 'visual', light: 'invert',
    load: () => import('@designcodeio/threeui/components/OrbitalSphereBackground').then(pick('OrbitalSphereBackground')),
  },
  GenerativeTree: {
    use: 'Growing particle tree. Growth, development, roots → outcomes, education.',
    role: 'visual', light: 'invert',
    load: () => import('@designcodeio/threeui/components/GenerativeTree').then(pick('GenerativeTree')),
  },
  LogicCoreField: {
    use: 'Processing core / reactor. AI, computation, engine of the system.',
    role: 'visual', light: 'invert',
    load: () => import('@designcodeio/threeui/components/LogicCoreField').then(pick('LogicCoreField')),
  },
  TopologyField: {
    use: 'Undulating topology mesh. Complexity, landscape of forces, data terrain.',
    role: 'visual', light: 'invert',
    load: () => import('@designcodeio/threeui/components/TopologyField').then(pick('TopologyField')),
  },
};

export type ThreeUIName = keyof typeof THREEUI;
