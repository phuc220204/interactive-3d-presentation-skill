/**
 * THEME SYSTEM — one deck engine, many looks.
 *
 *   theme   = preset('whiteboard', { colors: { accent: '#0a7' } })   ← content/theme.ts
 *   ?theme=sketchbook in the URL overrides the preset for a quick preview; Shift+T cycles presets (dev only).
 *
 * A theme drives: CSS tokens (Tailwind bg-bg, text-accent…), fonts, card "skin",
 * background surface pattern, how the 3D scenes blend (glow on dark / ink on light), bloom, grain.
 */

export type Mode = 'dark' | 'light';
/** Visual treatment of cards, highlights, borders. */
export type Skin = 'editorial' | 'clean' | 'sketch' | 'chalk' | 'drafting';
/** Procedural background pattern drawn behind the 3D scene. */
export type Surface = 'plain' | 'grid' | 'dots' | 'lined' | 'blueprint' | 'paper' | 'chalk' | 'drafting';

export interface ThemeColors {
  bg: string; //     page / canvas background
  bg2: string; //    card surfaces
  ink: string; //    primary text
  muted: string; //  secondary text
  line: string; //   hairlines / grids
  accent: string; // positive · unity · solution
  alert: string; //  conflict · risk · warning
  cool: string; //   data · neutral · legal
  paper: string; //  3D documents (cards scene)
}

export interface Theme {
  name: string;
  label: string;
  mode: Mode;
  skin: Skin;
  surface: Surface;
  colors: ThemeColors;
  fonts: { display: string; sans: string; mono: string };
  /** headline weight (hand-drawn fonts only ship 400) */
  displayWeight: number;
  displayTracking: string;
  /** additive glow for 3D lines/particles — only looks right on dark backgrounds */
  glow: boolean;
  bloom: number; // 0 disables post-processing
  grain: number; // 0–0.15
  radius: number; // card corner radius (px)
  /**
   * Optional post-processing looks for the 3D layer (subtle by default; pick at most one or two):
   *   chromatic: 0.0004–0.0015  lens fringe (tech, neon)      dof: true      soft depth of field (models, galleries)
   *   tiltShift: true           miniature look (travel, maps) sepia: 0–1     archival tone (history)
   *   halftone: true            print dots (editorial, comics) noise: 0–0.3  film grain in 3D
   */
  effects?: { chromatic?: number; dof?: boolean; tiltShift?: boolean; sepia?: number; halftone?: boolean; noise?: number };
  /** slide change: 'fade' (default) or 'wipe' (clip-path sweep led by a glowing scan line) */
  transition?: 'fade' | 'wipe';
  /** progress indicator: 'bar' (default) or 'thread' (wavy line with a knot where the speaker changes) */
  progress?: 'bar' | 'thread';
  /** photo duotone: [shadows, highlights]; computed when omitted */
  duotone?: [string, string];
}

const SERIF = "'Playfair Display', 'Times New Roman', serif";
const VN_SANS = "'Be Vietnam Pro', system-ui, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

export const PRESETS = {
  /** Cinematic editorial, deep obsidian + gold/vermilion. Default. */
  obsidian: {
    name: 'obsidian', label: 'Obsidian Editorial', mode: 'dark', skin: 'editorial', surface: 'plain',
    colors: { bg: '#08080b', bg2: '#121319', ink: '#f4f2ee', muted: '#8e929f', line: '#2a2c35', accent: '#e8b04a', alert: '#e0473c', cool: '#7cc4d8', paper: '#efebe3' },
    fonts: { display: SERIF, sans: VN_SANS, mono: MONO },
    displayWeight: 700, displayTracking: '-0.01em', glow: true, bloom: 0.75, grain: 0.07, radius: 2,
  },
  /** Clean classroom whiteboard: white grid, marker colours, rounded cards. */
  whiteboard: {
    name: 'whiteboard', label: 'Whiteboard', mode: 'light', skin: 'clean', surface: 'grid',
    colors: { bg: '#fbfbf9', bg2: '#ffffff', ink: '#1d2430', muted: '#667085', line: '#e4e7ec', accent: '#1f5fd6', alert: '#d92d20', cool: '#079455', paper: '#ffffff' },
    fonts: { display: VN_SANS, sans: VN_SANS, mono: MONO },
    displayWeight: 800, displayTracking: '-0.025em', glow: false, bloom: 0, grain: 0.02, radius: 14,
  },
  /** Hand-drawn sketchbook: warm paper, pencil ink, highlighter marks. */
  sketchbook: {
    name: 'sketchbook', label: 'Sketchbook', mode: 'light', skin: 'sketch', surface: 'paper',
    colors: { bg: '#f3ecdf', bg2: '#fbf7ef', ink: '#2b2622', muted: '#7a6f63', line: '#d8cbb5', accent: '#e8902a', alert: '#c8372d', cool: '#2f6fa3', paper: '#fffdf7' },
    fonts: { display: "'Pangolin', 'Patrick Hand', cursive", sans: "'Mali', 'Be Vietnam Pro', sans-serif", mono: "'Patrick Hand', 'Mali', cursive" },
    displayWeight: 400, displayTracking: '0', glow: false, bloom: 0, grain: 0.09, radius: 10,
  },
  /** Green chalkboard: matte chalk strokes, dashed frames. */
  chalkboard: {
    name: 'chalkboard', label: 'Chalkboard', mode: 'dark', skin: 'chalk', surface: 'chalk',
    colors: { bg: '#1e2a23', bg2: '#25332b', ink: '#efeee6', muted: '#a7b0a2', line: '#405046', accent: '#f4d36b', alert: '#f39189', cool: '#8fd3e8', paper: '#ebe8dd' },
    fonts: { display: "'Itim', 'Mali', cursive", sans: "'Mali', 'Be Vietnam Pro', sans-serif", mono: "'Patrick Hand', 'Mali', cursive" },
    displayWeight: 400, displayTracking: '0', glow: false, bloom: 0, grain: 0.1, radius: 4,
  },
  /** Engineering blueprint: cyan-blue sheet, 2-level grid, technical type. */
  blueprint: {
    name: 'blueprint', label: 'Blueprint', mode: 'dark', skin: 'editorial', surface: 'blueprint',
    colors: { bg: '#0c2847', bg2: '#11345c', ink: '#eaf2fb', muted: '#93b4d4', line: '#2b5786', accent: '#ffd166', alert: '#ff7a6b', cool: '#8ee3ff', paper: '#eaf2fb' },
    fonts: { display: "'Space Grotesk', 'Be Vietnam Pro', sans-serif", sans: VN_SANS, mono: "'IBM Plex Mono', ui-monospace, monospace" },
    displayWeight: 700, displayTracking: '-0.02em', glow: true, bloom: 0.45, grain: 0.05, radius: 2,
  },
  /** Light newspaper / academic print: ivory paper, serif, crimson + gold. */
  ivory: {
    name: 'ivory', label: 'Ivory Press', mode: 'light', skin: 'editorial', surface: 'paper',
    colors: { bg: '#f4f0e6', bg2: '#fbf8f1', ink: '#1b1a17', muted: '#6c665a', line: '#d6cebb', accent: '#a8740a', alert: '#a4161a', cool: '#1d4e89', paper: '#fffdf8' },
    fonts: { display: SERIF, sans: "'Lora', Georgia, serif", mono: "'IBM Plex Mono', ui-monospace, monospace" },
    displayWeight: 700, displayTracking: '-0.01em', glow: false, bloom: 0, grain: 0.06, radius: 0,
  },
  /** Neon / tech keynote: deep violet-black, lime + magenta, strong glow. */
  neon: {
    name: 'neon', label: 'Neon Keynote', mode: 'dark', skin: 'editorial', surface: 'dots',
    colors: { bg: '#07060d', bg2: '#120f22', ink: '#f5f3ff', muted: '#9a93b8', line: '#2a2545', accent: '#c6ff3d', alert: '#ff3d81', cool: '#3de1ff', paper: '#f5f3ff' },
    fonts: { display: "'Space Grotesk', 'Be Vietnam Pro', sans-serif", sans: VN_SANS, mono: MONO },
    displayWeight: 700, displayTracking: '-0.03em', glow: true, bloom: 1.05, grain: 0.05, radius: 6,
  },
  /** Technical drawing on tracing paper: two-level grid, self-drawing outlines, hatching, dimension lines, wipe transition. */
  drafting: {
    name: 'drafting', label: 'Drafting Table', mode: 'light', skin: 'drafting', surface: 'drafting',
    colors: { bg: '#f1f0ea', bg2: '#fbfaf6', ink: '#1d2733', muted: '#5b6672', line: '#c6ccd2', accent: '#1f5fa8', alert: '#c23b2a', cool: '#2c7a69', paper: '#ffffff' },
    fonts: { display: "'Space Grotesk', 'Be Vietnam Pro', sans-serif", sans: VN_SANS, mono: "'IBM Plex Mono', ui-monospace, monospace" },
    displayWeight: 700, displayTracking: '-0.02em', glow: false, bloom: 0, grain: 0.03, radius: 0, transition: 'wipe', progress: 'thread',
  },
} satisfies Record<string, Theme>;

export type PresetName = keyof typeof PRESETS;
export const PRESET_NAMES = Object.keys(PRESETS) as PresetName[];

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? Partial<T[K]> : T[K] };

function mix(a: string, b: string, t: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

/** Build the active theme: preset + overrides, with `?theme=` URL override for previews. */
export function preset(name: PresetName, overrides: DeepPartial<Theme> = {}): Theme {
  const fromUrl = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('theme') : null;
  const useUrl = fromUrl && fromUrl in PRESETS;
  const base: Theme = PRESETS[(useUrl ? fromUrl : name) as PresetName];
  const o = useUrl ? {} : overrides; // URL preview shows the pure preset
  const t: Theme = {
    ...base,
    ...o,
    colors: { ...base.colors, ...(o.colors ?? {}) },
    fonts: { ...base.fonts, ...(o.fonts ?? {}) },
  } as Theme;
  if (readLook() === 'alt') flipLook(t);
  if (!t.duotone) {
    const c = t.colors;
    t.duotone = t.mode === 'dark' ? [c.bg, mix(c.accent, c.ink, 0.35)] : [mix(c.ink, c.accent, 0.25), c.bg];
  }
  return t;
}

/* ------------------------------------------------------------------ */
/* Light ↔ dark variant of the SAME theme (key D, or ?look=alt)         */
/* ------------------------------------------------------------------ */
const LOOK_KEY = 'deck-look';
function readLook(): 'base' | 'alt' {
  if (typeof location === 'undefined') return 'base';
  const q = new URLSearchParams(location.search).get('look');
  if (q === 'alt' || q === 'base') return q;
  try {
    return localStorage.getItem(LOOK_KEY) === 'alt' ? 'alt' : 'base';
  } catch {
    return 'base';
  }
}
/** Toggle the alternative look and reload (3D materials read colours at start). Hash (slide.beat) is kept. */
export function toggleLook() {
  try {
    localStorage.setItem(LOOK_KEY, readLook() === 'alt' ? 'base' : 'alt');
  } catch {
    /* storage blocked: nothing to remember */
  }
  const u = new URL(location.href);
  if (u.searchParams.has('look')) {
    u.searchParams.delete('look');
    location.replace(u.toString());
  } else location.reload(); // same URL (only the #slide differs) would not reload
}
const lum = (h: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
/** Same fonts, skin and accents; background and ink swapped; accents pushed towards readable contrast. */
function flipLook(t: Theme) {
  const c = t.colors;
  const toDark = t.mode === 'light';
  const bg = toDark ? mix(c.ink, '#000000', 0.55) : mix(c.ink, '#ffffff', 0.94);
  const ink = toDark ? mix(c.bg, '#ffffff', 0.5) : mix(c.bg, '#000000', 0.82);
  const fix = (x: string) => (toDark ? (lum(x) < 0.45 ? mix(x, '#ffffff', 0.4) : x) : lum(x) > 0.45 ? mix(x, '#000000', 0.45) : x);
  t.colors = {
    bg,
    bg2: mix(bg, ink, 0.07),
    ink,
    muted: mix(ink, bg, 0.4),
    line: mix(bg, ink, 0.2),
    accent: fix(c.accent),
    alert: fix(c.alert),
    cool: fix(c.cool),
    paper: c.paper,
  };
  t.mode = toDark ? 'dark' : 'light';
  t.glow = toDark;
  t.bloom = toDark ? 0.4 : 0;
  t.duotone = undefined;
}
