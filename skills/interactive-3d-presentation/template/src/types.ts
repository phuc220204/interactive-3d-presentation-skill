/**
 * DECK SCHEMA — the contract between content (src/content/*) and the engine.
 * An AI agent fills src/content/slides.ts with `Slide[]`; everything else renders automatically.
 *
 * Rich text (type `Rich`) supports inline markers:
 *   **text**  → accent  (positive / unity / solution / benefit)   — e.g. gold
 *   !!text!!  → alert   (conflict / risk / bottleneck / warning)   — e.g. crimson
 *   ==text==  → data    (neutral figures, legal codes, key terms)  — cool tone, mono-ish weight
 *   *text*    → italic emphasis
 *   \n        → line break
 */
export type Rich = string;

export type Tone = 'accent' | 'alert' | 'cool' | 'ink' | 'muted';

/** [latitude, longitude] in degrees */
export type LatLon = [number, number];

/* ------------------------------------------------------------------ */
/* Layouts                                                             */
/* ------------------------------------------------------------------ */

export type Layout =
  | 'cover' //       opening slide: huge title left, meta row, 3D on the right
  | 'split' //       text column left (≈ 6/12), 3D object fills the right half  ← default
  | 'split-right' // mirrored: 3D left, text right
  | 'center' //      centred statement / quote; 3D behind, dimmed
  | 'grid' //        title on top, full-width block area (bento, table, timeline)
  | 'full' //        3D or backdrop image dominates; small caption bottom-left
  | 'references' // final APA list, internally scrollable
  | 'section'; //   part opener: huge outlined number, phrase-split title, speaker + slide range

/* ------------------------------------------------------------------ */
/* Blocks (content components)                                         */
/* ------------------------------------------------------------------ */

export interface MetricItem {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string; // e.g. " tỷ USD", "%"
  label: Rich;
  note?: Rich;
  tone?: Tone;
  /** source id → the figure becomes a clickable citation */
  source?: string;
}
export interface MetricBlock {
  type: 'metric';
  items: MetricItem[]; // 1–3; first item renders largest when `hero` is true
  hero?: boolean;
}

export interface CompareSide {
  title: Rich;
  tone?: Tone;
  tag?: string; // small mono label, e.g. "THỐNG NHẤT"
  points: Rich[];
}
export interface CompareBlock {
  type: 'compare';
  left: CompareSide;
  right: CompareSide;
  relation?: 'vs' | 'and' | 'to'; // glyph in the middle: ⟷, +, →
  verdict?: Rich; // conclusion bar under both columns
}

export interface BentoItem {
  title: Rich;
  body?: Rich;
  detail?: Rich; // revealed on click (presenter can expand during Q&A)
  tag?: string;
  tone?: Tone;
  span?: 1 | 2;
  value?: string; // optional big figure at the top of the card
}
export interface BentoBlock {
  type: 'bento';
  columns?: 2 | 3 | 4;
  items: BentoItem[];
}

export interface TimelineItem {
  date: string;
  title: Rich;
  body?: Rich;
  tone?: Tone;
}
export interface TimelineBlock {
  type: 'timeline';
  items: TimelineItem[]; // 3–6
  active?: number; // index of highlighted milestone
}

export interface FlowStep {
  title: Rich;
  body?: Rich;
  tone?: Tone;
}
export interface FlowBlock {
  type: 'flow';
  steps: FlowStep[]; // 2–5
  direction?: 'row' | 'column';
}

export interface QuoteBlock {
  type: 'quote';
  text: Rich;
  author?: string;
  role?: string;
  /** type the quote out letter by letter with a blinking caret */
  typing?: boolean;
}

export interface CalloutBlock {
  type: 'callout';
  tone?: Tone;
  label?: string; // e.g. "LƯU Ý", "KẾT LUẬN"
  body: Rich;
  /** 'stamp' = slams in like a rubber stamp (verdicts, conclusions) · 'ants' = marching dashed border (open question, blank to fill) */
  style?: 'stamp' | 'ants';
}

export interface TableBlock {
  type: 'table';
  columns: Rich[];
  rows: Rich[][];
  highlightCol?: number;
  rowTones?: (Tone | undefined)[];
}

export interface BarsBlock {
  type: 'bars';
  unit?: string;
  decimals?: number;
  items: { label: Rich; value: number; tone?: Tone }[];
}

export interface ListBlock {
  type: 'list';
  style?: 'bullet' | 'numbered' | 'check';
  items: Rich[];
}

export interface ImageBlock {
  type: 'image';
  src: string;
  alt: string;
  caption?: Rich;
  credit?: string; // short credit line shown on the image
  /** default 'color' = the photo's real colours. 'duotone' / 'mono' only when the author asks for a styled look. */
  treatment?: 'duotone' | 'mono' | 'color';
  ratio?: string; // CSS aspect-ratio, default "16 / 10"
}

export interface ReferencesBlock {
  type: 'references';
}

export interface ChartSeries {
  name: string;
  values: number[];
  tone?: Tone;
}
/** SVG charts: line / area (trends), donut (shares of a whole), stacked (composition per category). */
export interface ChartBlock {
  type: 'chart';
  kind: 'line' | 'area' | 'donut' | 'stacked';
  /** x categories (line/area/stacked) or segment names (donut) */
  labels: string[];
  /** donut uses series[0] */
  series: ChartSeries[];
  unit?: string;
  decimals?: number;
  height?: number; // px, default 300
  caption?: Rich;
  /** source id of the data (adds a clickable citation under the chart) */
  source?: string;
}

/** Syntax-highlighted code (prism): ts, tsx, js, jsx, python, json, css, markup, sql, go, rust, cpp, swift, kotlin, yaml… */
export interface CodeBlock {
  type: 'code';
  lang: string;
  code: string;
  title?: string; // filename shown in the window bar
  highlight?: number[]; // 1-based line numbers to emphasise
  caption?: Rich;
}

/** Display formula rendered with KaTeX. Inline math inside any Rich text: $$E = mc^2$$ */
export interface MathBlock {
  type: 'math';
  tex: string;
  caption?: Rich;
}

export interface GalleryBlock {
  type: 'gallery';
  items: { src: string; alt: string; caption?: Rich; credit?: string }[];
  columns?: 2 | 3 | 4;
  /** default 'color' = the photo's real colours. 'duotone' / 'mono' only when the author asks for a styled look. */
  treatment?: 'duotone' | 'mono' | 'color';
  ratio?: string; // default "4 / 3"
}

export interface VideoBlock {
  type: 'video';
  /** mp4/webm URL (autoplays muted, loops) … */
  src?: string;
  /** … or a YouTube video id (loads only when clicked) */
  youtube?: string;
  poster?: string;
  caption?: Rich;
  ratio?: string; // default "16 / 9"
}

/** SVG / CSS diagram file (public/assets/diagrams/…) drawn on stroke by stroke; colours from theme variables. */
export interface DiagramBlock {
  type: 'diagram';
  src: string; // .svg path (inlined so strokes can animate and use var(--c-*) colours)
  alt: string;
  caption?: Rich;
  height?: number; // px, default 420
  draw?: boolean; // animate strokes on enter / reveal (default true)
}

/** Lottie / dotLottie motion asset (icons, illustrations, characters). */
export interface LottieBlock {
  type: 'lottie';
  src: string; // .lottie or .json URL / public path
  alt: string;
  loop?: boolean; // default true
  height?: number; // px, default 360
  caption?: Rich;
}

/** 100-cell (or `total`) grid of units: shares of a whole that people can count ("86 of 100 workers"). */
export interface WaffleBlock {
  type: 'waffle';
  parts: { value: number; label: Rich; tone?: Tone }[]; // values sum to ≤ total; rest is shown empty
  total?: number; // default 100 (10 × 10)
  icon?: 'square' | 'circle' | 'person' | 'coin' | 'house' | 'drop' | 'tree'; // cell shape
  caption?: Rich;
  source?: string;
}

/** Ring gauges with ticks: progress against a maximum or target ("72% of the 2030 goal"). 1–3 items. */
export interface GaugeBlock {
  type: 'gauge';
  items: { value: number; max?: number; target?: number; label: Rich; suffix?: string; decimals?: number; tone?: Tone; source?: string }[];
  caption?: Rich;
}

/** Engineering dimension lines: lengths drawn to scale with arrowheads, label counts up (durations, distances, gaps). */
export interface DimensionBlock {
  type: 'dimension';
  items: { label: Rich; value: number; display?: string; tone?: Tone }[]; // 1–4 lines, longest = full width
  unit?: string;
  caption?: Rich;
  source?: string;
}

/** Live what-if model: the presenter drags a slider, outputs recompute (safe formula like plot.fn, variable x). */
export interface SimulationBlock {
  type: 'simulation';
  input: { label: Rich; min: number; max: number; step?: number; value?: number; unit?: string };
  outputs: { label: Rich; fn: string; unit?: string; decimals?: number; tone?: Tone }[]; // 1–3; fn uses x
  /** 'bars' = each output as a bar (max = largest value over the range) · 'balance' = beam tilts by outputs[0] − outputs[1] */
  viz?: 'bars' | 'balance' | 'none';
  autoplay?: boolean; // sweep min → value once when the slide opens
  caption?: Rich;
}

/** Fields every block accepts. */
export interface BlockBase {
  /** name this block so slide.connectors can draw a line to / from it */
  id?: string;
  /** reveal this block at beat k (nhịp) instead of on slide entry */
  beat?: number;
  /** list / bento / timeline / flow / table: reveal one item per beat, starting at `beat` (default 1) */
  stepwise?: boolean;
}

export type Block = BlockBase & (
  | MetricBlock
  | CompareBlock
  | BentoBlock
  | TimelineBlock
  | FlowBlock
  | QuoteBlock
  | CalloutBlock
  | TableBlock
  | BarsBlock
  | ListBlock
  | ImageBlock
  | ReferencesBlock
  | ChartBlock
  | CodeBlock
  | MathBlock
  | GalleryBlock
  | VideoBlock
  | DiagramBlock
  | LottieBlock
  | WaffleBlock
  | GaugeBlock
  | DimensionBlock
  | SimulationBlock
);

/* ------------------------------------------------------------------ */
/* 3D scenes — content-bearing, driven by data                          */
/* ------------------------------------------------------------------ */

interface SceneBase {
  /**
   * REQUIRED for every scene except 'ambient': one sentence saying what this visual explains
   * on this slide (e.g. "Chiều cao cột so sánh GDP Việt Nam với doanh thu Apple"). If you cannot
   * write it, the slide does not need a 3D scene — use 'ambient'.
   */
  purpose?: string;
  /** Where the object sits, as a fraction of the 16:9 stage. Defaults per layout. */
  anchor?: [number, number];
  /** Size multiplier (1 = default). */
  scale?: number;
}

export interface AmbientScene extends SceneBase {
  name: 'ambient';
  state?: { density?: number; tone?: Tone };
}

export interface GlobeScene extends SceneBase {
  name: 'globe';
  state: {
    focus?: LatLon; // rotates this point to face the viewer
    arcs?: { from: LatLon; to: LatLon; tone?: Tone }[];
    points?: { at: LatLon; label?: string; tone?: Tone }[];
    /** Show Hoàng Sa & Trường Sa (Việt Nam) labels — default true when focus is near Vietnam */
    vnSovereignty?: boolean;
    spin?: boolean;
    /** ordered stops → numbered markers joined by sequential arcs (travel, campaigns, migrations) */
    route?: { at: LatLon; label?: string }[];
    /** index of the current stop in `route` (globe turns to it) */
    active?: number;
    /** countries painted in a strong colour with a bold outline — the subject of the slide ("Vietnam", "Thailand"… English Natural Earth names, or ISO numeric id) */
    highlight?: string[];
    /** colour of highlight (default 'alert' = red) */
    tone?: Tone;
    /** draw every country border (default: on when highlight is set) */
    borders?: boolean;
    /** areas inside a country, e.g. a delta or a province: [lat, lon] polygon, filled + outlined + labelled */
    regions?: { name: string; polygon: LatLon[]; tone?: Tone }[];
    /** 1 = whole globe; 2–4 moves in on the focus (tweened, works in sceneBeats) */
    zoom?: number;
  };
}

/** 2D images shown as 3D: framed photos / artworks on a curved wall, flat wall or stacked deck. */
export interface GalleryScene extends SceneBase {
  name: 'gallery';
  state: {
    items: { src: string; label?: string }[];
    focus?: number; // index brought to the front
    arrangement?: 'arc' | 'wall' | 'stack';
    frame?: boolean; // paper passe-partout (default true)
  };
}

/** 2.5D depth from layered 2D assets (background photo + PNG cut-outs / illustrations). */
export interface ParallaxScene extends SceneBase {
  name: 'parallax';
  state: {
    /** back to front; depth 0 = far background, 1 = closest. x/y offsets in units (-2..2), scale default 1 */
    layers: { src: string; depth: number; scale?: number; x?: number; y?: number }[];
  };
}

/** glTF/GLB 3D model: artefacts, monuments, molecules, products. */
export interface ModelScene extends SceneBase {
  name: 'model';
  state: {
    src: string; // .glb / .gltf URL (public/models/… or remote CORS URL)
    rotate?: boolean; // turntable (default true)
    tilt?: number; // radians around x (default 0.15)
    /** labelled points, coordinates as fractions of the model's bounding box (-1..1) */
    hotspots?: { at: [number, number, number]; label: string }[];
    /** glTF morph targets → influence 0..1, tweened (use with sceneBeats to morph per beat) */
    morph?: Record<string, number>;
    /** name of a glTF animation clip to play in a loop (e.g. 'Walk') */
    clip?: string;
  };
}

/** Math plots: z = f(x, y) surface, y = f(x) curve, or a data matrix as a surface. */
export interface PlotScene extends SceneBase {
  name: 'plot';
  state: {
    mode?: 'surface' | 'curve';
    /** expression in x (curve) or x, y (surface): + - * / ^ ( ) sin cos tan exp log sqrt abs pow min max pi e */
    fn?: string;
    /** alternative to fn for surfaces: rows of heights */
    matrix?: number[][];
    range?: [number, number]; // default [-3, 3]
    label?: string; // e.g. "z = sin(x)·cos(y)"
    tone?: Tone;
  };
}

export interface TowersScene extends SceneBase {
  name: 'towers';
  state: {
    items: { label: string; value: number; tone?: Tone; display?: string }[];
    unit?: string;
  };
}

export type MorphShape =
  | 'sphere'
  | 'grid'
  | 'wave'
  | 'cluster' //  several scattered clusters (fragmentation, many small actors)
  | 'converge' // one dense core (unity, centralisation)
  | 'split' //    two opposing masses (conflict, comparison)
  | 'ring'
  | 'helix'
  | 'cube'
  | 'scatter'
  | 'person' //   a human figure (people, workers, users)
  | 'gear' //     machine, industry, process
  | 'chip' //     technology, computing
  | 'house' //    home, housing, family
  | 'arrow'; //   growth, rise, direction
export interface MorphScene extends SceneBase {
  name: 'morph';
  state: {
    shape?: MorphShape;
    /** custom silhouette: SVG path data in a 0–100 box (y down), e.g. a country outline or a product shape */
    path?: string;
    tone?: Tone;
    /** autoplay a sequence of shapes, each with a label (e.g. 4 eras of production) — changes every stageSeconds */
    stages?: { shape?: MorphShape; path?: string; label?: string }[];
    stageSeconds?: number;
    /** show every stage at once as a 2×2 grid with arrows (turn it on at the last beat via slide.sceneBeats) */
    summary?: boolean;
  };
}

export interface NetworkScene extends SceneBase {
  name: 'network';
  state: {
    nodes: { id: string; label?: string; tone?: Tone; size?: number; center?: boolean }[];
    links: { a: string; b: string; tone?: Tone }[];
  };
}

export interface FlowScene extends SceneBase {
  name: 'flow';
  state: { steps: { label: string; tone?: Tone }[]; active?: number };
}

export interface TimelineScene extends SceneBase {
  name: 'timeline';
  state: { items: { label: string; tone?: Tone }[]; active?: number };
}

export interface CardsScene extends SceneBase {
  name: 'cards';
  state: {
    cards: {
      kind?: 'doc' | 'invoice' | 'qr' | 'photo' | 'chart' | 'note' | 'code' | 'book' | 'phone' | 'ticket' | 'letter' | 'map';
      label?: string;
      src?: string;
      tone?: Tone;
    }[];
  };
}

/**
 * A ThreeUI Community effect (see src/threeui/catalog.ts for names + when to use each).
 * Atmosphere / concept visual only — use the R3F scenes above when the slide has real data.
 */
export interface ThreeUIScene extends SceneBase {
  name: 'threeui';
  component: string;
  /** visual tuning passed to the effect: hue, saturation, brightness, opacity, speed… */
  props?: Record<string, unknown>;
  /** background = full-bleed atmosphere under the text; visual = inside the layout's 3D region */
  placement?: 'background' | 'visual';
}

/** Extruded 3D gears turning together: machine, production, process, a system of parts. */
export interface GearScene extends SceneBase {
  name: 'gear';
  state: {
    teeth?: number; // main gear, default 18
    tone?: Tone;
    spin?: boolean; // default true
    /** [main gear, small gear 1, small gear 2] — what each part stands for */
    labels?: string[];
  };
}

export type SceneSpec =
  | ThreeUIScene
  | GearScene
  | AmbientScene
  | GlobeScene
  | TowersScene
  | MorphScene
  | NetworkScene
  | FlowScene
  | TimelineScene
  | CardsScene
  | GalleryScene
  | ParallaxScene
  | ModelScene
  | PlotScene
  | SplineScene;

/** Scene authored in Spline (spline.design) — exported "Public URL" (.splinecode). Rendered in a DOM layer. */
export interface SplineScene extends SceneBase {
  name: 'spline';
  scene: string; // https://prod.spline.design/<id>/scene.splinecode  (or a local public/ path)
  placement?: 'background' | 'visual';
}

export type SceneName = SceneSpec['name'];

/* ------------------------------------------------------------------ */
/* Slide                                                               */
/* ------------------------------------------------------------------ */

export interface BackdropImage {
  src: string;
  alt: string;
  /** id of the entry in sources.ts that credits this image */
  sourceId?: string;
  /** default 'color' = the photo's real colours. 'duotone' / 'mono' only when the author asks for a styled look. */
  treatment?: 'duotone' | 'mono' | 'color';
  opacity?: number; // 0–1, default 0.55
}

export interface Slide {
  /** Stable id. Convention: "s01", "s02"… (matches notes.ts + scaffold output). */
  id: string;
  /** Short section label shown top-right, e.g. "Biểu hiện mới". */
  section: string;
  layout?: Layout;
  kicker?: string; // "04 · BIỂU HIỆN MỚI 1/3"
  title: Rich;
  subtitle?: Rich;
  lead?: Rich; // 1–3 sentence intro paragraph
  meta?: { label: string; value: string }[]; // cover: group, members, lecturer…
  blocks?: Block[];
  scene: SceneSpec;
  image?: BackdropImage;
  scope?: Rich; // "GIỚI HẠN" footnote
  sources?: string[]; // ids from sources.ts → rendered as "NGUỒN" footer
  /** who presents this slide (script + presenter view) */
  speaker?: string;
  /** explicit number of beats (otherwise computed from block.beat / stepwise / sceneBeats) */
  beats?: number;
  /** partial scene state per beat, merged cumulatively: [base?, {active: 1}, {active: 2}] */
  sceneBeats?: Record<string, unknown>[];
  /** Theatre.js camera/object sequence to play on this slide (authored in ?studio, saved in content/theatre-state.json) */
  camera?: { sequence: string; duration?: number };
  /** hand-drawn pen marks timed to the talk: circle / underline / box a phrase, or an arrow with a note */
  annotations?: Annotation[];
  /** right-angle connector lines between blocks that have an `id` (accent = flowing dashes + moving packets) */
  connectors?: { from: string; to: string; accent?: boolean; beat?: number }[];
  /** planned speaking time for this slide (minutes) → presenter view shows planned vs elapsed; SCRIPT.md lists it */
  minutes?: number;
  /** extra wait (ms) before the QA screenshot of this slide (heavy model / Spline / long animation) */
  qaWait?: number;
}

/** Pen annotation. target = a phrase that appears on the slide (first match) or a CSS selector ("#id", ".class"). */
export interface Annotation {
  type: 'circle' | 'underline' | 'box' | 'arrow';
  target: string;
  beat?: number; // appears at this beat (default: on entry)
  tone?: Tone; // default 'alert'
  note?: string; // handwritten note next to the mark (arrow: at the tail)
  dim?: boolean; // fade everything else while the mark is shown
}

export interface Source {
  id: string;
  /** media URLs / paths this entry credits (photos, models, lottie, spline…) — the validator matches assets to credits */
  assets?: string[];
  /** Full APA 7 reference string. */
  apa: string;
  /** Short in-text form shown in footers, e.g. "UNCTAD (2025)". */
  short: string;
  url?: string;
  /**
   * text/data: references · photo: real photograph · user: provided by the author · ai: AI-generated DECORATION
   * diagram: SVG/CSS made for the deck · video · model (glTF) · lottie · spline · effect (code library)
   * ('image' = legacy alias of photo)
   */
  kind?: 'text' | 'data' | 'photo' | 'image' | 'user' | 'ai' | 'diagram' | 'video' | 'model' | 'lottie' | 'spline' | 'effect';
  license?: string; // "CC BY-SA 4.0", "Unsplash License", "CC0", "MIT"…
  /** page / section in the source where the figure or quote is ("tr. 112", "Table 3") — shown in the source drawer */
  page?: string;
  /** what this figure measures / why it is cited ("GDP danh nghĩa, giá hiện hành") — shown in the source drawer */
  use?: string;
  /** verification status: 'original' = read at the publisher; 'secondary' = read via press/journal ("Dẫn lại") */
  status?: 'original' | 'secondary';
  /** AI assets only: must be false — AI images never depict real people, events, places-as-evidence or data */
  depictsReal?: boolean;
}

export interface DeckMeta {
  title: string;
  brand: string; // top-left HUD tag, e.g. "N6 · MLN122"
  /** UI language: 'vi' | 'en' (default 'vi'). */
  lang?: 'vi' | 'en';
  /** number/date formatting; default from lang ('vi-VN' | 'en-US') */
  locale?: string;
  /** override any UI string from src/i18n.ts, e.g. { sources: 'Tham khảo' } */
  labels?: Record<string, string>;
  /** 'deck' (default, 16:9 slides) or 'scroll' (landing page with Lenis smooth scroll) */
  mode?: 'deck' | 'scroll';
  /** target talk length → npm run script warns when the estimate is longer */
  targetMinutes?: number;
  /** present without internet: npm run assets:pull must have localised every remote asset */
  offline?: boolean;
  /** source URLs on these domains fail validation (e.g. ['wikipedia.org', 'blogspot.com'] for academic decks) */
  bannedDomains?: string[];
  /** academic deck: also ban the default list of non-evidence domains (Wikipedia, social media, blogs, AI chat…) */
  academic?: boolean;
  /** words that need careful wording → validator warns on every slide / note that uses them */
  sensitiveTerms?: string[];
}

/**
 * BRIEF — the art direction agreed with the user BEFORE building (see references/brief-intake.md).
 * The validator uses it to keep the deck consistent: one theme, one effect family, calm vs cinematic motion.
 */
export interface Brief {
  purpose: string; //  e.g. "Thuyết trình môn học 15 phút", "Pitch gọi vốn"
  audience: string; // e.g. "Giảng viên và lớp", "Nhà đầu tư"
  minutes?: number;
  lang: 'vi' | 'en';
  theme: string; //   preset name used in theme.ts
  /** the ONE visual family of this deck */
  family: 'data-3d' | 'editorial-2d' | 'illustrated' | 'cinematic' | 'technical' | 'playful';
  /** scenes this deck may use (others fail validation). 'ambient' is always allowed. */
  scenes: string[];
  imagery: ('photo' | 'user' | 'diagram' | 'ai' | 'video' | 'model' | 'lottie' | 'spline' | 'none')[];
  motion: 'calm' | 'standard' | 'cinematic';
  interaction: ('keys' | 'click' | 'wheel' | 'clicker' | 'qa-cards' | 'presenter-window')[];
  offline: boolean;
  notes?: string; // anything else the user asked for (fonts, colours, brand…)
}
