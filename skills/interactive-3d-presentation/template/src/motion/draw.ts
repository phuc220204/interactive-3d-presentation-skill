/**
 * Drawing helpers for the 2D "technical drawing" effects (ported from a hand-built GSAP deck).
 *
 *  maskDraw(path, opts)   reveals a stroke as if drawn by a pen — keeps dashes and arrowheads intact
 *                         (animates a white mask stroke, not the path's own dasharray); optional pen-tip dot.
 *  wobbleEllipse(...)     hand-drawn circle path that overshoots like a real pen stroke
 *  roughPath(points)      hand-drawn polyline (small perpendicular wobble every ~40px)
 *  elbow(a, b)            right-angle connector with rounded corners between two boxes
 *  parseFormatted / formatLike   count up "1.220", "4,53", "−48,34%", "60–80" keeping the original format
 */
import { EASE, gsap } from './gsap';
import { reducedMotion } from '../lib/pointer';

const SVGNS = 'http://www.w3.org/2000/svg';
let uid = 0;

export interface DrawOpts {
  duration?: number;
  delay?: number;
  ease?: string;
  /** small dot riding on the drawing tip */
  pen?: boolean;
  /** mask stroke width (must cover the real stroke + markers) */
  cover?: number;
}

/** Draw `path` stroke by revealing it through a mask. Returns the tween (kill it on unmount). */
export function maskDraw(path: SVGGeometryElement, o: DrawOpts = {}): gsap.core.Tween | null {
  const svg = path.ownerSVGElement;
  if (!svg) return null;
  let len = 0;
  try {
    len = path.getTotalLength();
  } catch {
    return null;
  }
  if (reducedMotion() || !len) return null;
  const id = `md${++uid}`;
  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS(SVGNS, 'defs');
    svg.prepend(defs);
  }
  const mask = document.createElementNS(SVGNS, 'mask');
  mask.setAttribute('id', id);
  mask.setAttribute('maskUnits', 'userSpaceOnUse');
  const clone = path.cloneNode() as SVGGeometryElement;
  for (const a of ['class', 'style', 'marker-start', 'marker-end', 'marker-mid', 'stroke-dasharray', 'id']) clone.removeAttribute(a);
  clone.setAttribute('fill', 'none');
  clone.setAttribute('stroke', 'white');
  clone.setAttribute('stroke-width', String(o.cover ?? 34));
  clone.setAttribute('stroke-linecap', 'round');
  clone.setAttribute('stroke-linejoin', 'round');
  clone.style.strokeDasharray = `${len} ${len}`;
  clone.style.strokeDashoffset = `${len}`;
  mask.appendChild(clone);
  defs.appendChild(mask);
  path.setAttribute('mask', `url(#${id})`);

  let tip: SVGCircleElement | null = null;
  if (o.pen) {
    tip = document.createElementNS(SVGNS, 'circle');
    tip.setAttribute('r', '4.5');
    tip.setAttribute('class', 'pen-tip');
    path.parentNode?.appendChild(tip);
  }
  const z = { f: 0 };
  return gsap.to(z, {
    f: 1,
    duration: o.duration ?? Math.min(1.6, 0.4 + len / 900),
    delay: o.delay ?? 0,
    ease: o.ease ?? EASE.inOut,
    onUpdate: () => {
      clone.style.strokeDashoffset = `${len * (1 - z.f)}`;
      if (tip) {
        const pt = path.getPointAtLength(len * z.f);
        tip.setAttribute('cx', String(pt.x));
        tip.setAttribute('cy', String(pt.y));
      }
    },
    onComplete: () => {
      tip?.remove();
      path.removeAttribute('mask');
      mask.remove();
    },
  });
}

/** Hand-drawn ellipse: slight wobble + overshoot past the start (2π + 0.45 rad). */
export function wobbleEllipse(cx: number, cy: number, rx: number, ry: number, seed = 1): string {
  const pts: string[] = [];
  const end = Math.PI * 2 + 0.45;
  for (let a = -0.3, i = 0; a <= end; a += 0.12, i++) {
    const t = a + seed;
    const k = 1 + 0.035 * Math.sin(3.1 * t + 1) + 0.02 * Math.sin(7.3 * t);
    const x = cx + rx * k * Math.cos(a);
    const y = cy + ry * k * Math.sin(a) * (1 + 0.04 * Math.cos(2 * a));
    pts.push(`${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

/** Hand-drawn polyline through points: splits long edges and wobbles them ±1.6px. */
export function roughPath(points: [number, number][], seed = 1): string {
  let d = '';
  points.forEach(([x, y], i) => {
    if (i === 0) {
      d = `M${x} ${y}`;
      return;
    }
    const [px, py] = points[i - 1];
    const len = Math.hypot(x - px, y - py);
    const n = Math.max(1, Math.round(len / 40));
    const nx = -(y - py) / (len || 1);
    const ny = (x - px) / (len || 1);
    for (let k = 1; k <= n; k++) {
      const f = k / n;
      const w = k === n ? 0 : Math.sin(seed * 9.1 + i * 3.7 + k * 1.9) * 1.6;
      d += ` L${(px + (x - px) * f + nx * w).toFixed(1)} ${(py + (y - py) * f + ny * w).toFixed(1)}`;
    }
  });
  return d;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
/** Right-angle connector from box a to box b with rounded corners (radius r). Vertical when b is below a. */
export function elbow(a: Box, b: Box, r = 12): string {
  const below = b.y >= a.y + a.h - 4;
  if (below) {
    const x1 = a.x + a.w / 2;
    const y1 = a.y + a.h;
    const x2 = b.x + b.w / 2;
    const y2 = b.y;
    const my = (y1 + y2) / 2;
    if (Math.abs(x2 - x1) < 2) return `M${x1} ${y1} V${y2}`;
    const s = Math.sign(x2 - x1);
    const rr = Math.min(r, Math.abs(x2 - x1) / 2, (y2 - y1) / 2);
    return `M${x1} ${y1} V${my - rr} Q${x1} ${my} ${x1 + s * rr} ${my} H${x2 - s * rr} Q${x2} ${my} ${x2} ${my + rr} V${y2}`;
  }
  const right = b.x >= a.x + a.w / 2;
  const x1 = right ? a.x + a.w : a.x;
  const y1 = a.y + a.h / 2;
  const x2 = right ? b.x : b.x + b.w;
  const y2 = b.y + b.h / 2;
  const mx = (x1 + x2) / 2;
  if (Math.abs(y2 - y1) < 2) return `M${x1} ${y1} H${x2}`;
  const s = Math.sign(y2 - y1);
  const dx = Math.sign(x2 - x1);
  const rr = Math.min(r, Math.abs(y2 - y1) / 2, Math.abs(x2 - x1) / 2);
  return `M${x1} ${y1} H${mx - dx * rr} Q${mx} ${y1} ${mx} ${y1 + s * rr} V${y2 - s * rr} Q${mx} ${y2} ${mx + dx * rr} ${y2} H${x2}`;
}

/* ---------------- format-preserving numbers ---------------- */
export interface Formatted {
  pre: string;
  values: number[];
  sep: string; // range separator
  post: string;
  decimals: number;
  thousands: string;
  decimal: string;
}
/** "1.220 tỷ", "4,53%", "−48,34", "60–80 năm", "$2.5M" → numeric parts + how to print them again. */
export function parseFormatted(text: string, lang: 'vi' | 'en' = 'vi'): Formatted | null {
  const m = text.match(/^([^\d−-]*?)([−-]?[\d.,]+)(?:\s*([–-])\s*([\d.,]+))?(.*)$/s);
  if (!m) return null;
  const vi = lang === 'vi';
  const thousands = vi ? '.' : ',';
  const decimal = vi ? ',' : '.';
  const num = (s: string) => {
    const neg = /^[−-]/.test(s);
    const clean = s.replace(/^[−-]/, '').split(thousands).join('').replace(decimal, '.');
    const v = Number(clean);
    return Number.isFinite(v) ? (neg ? -v : v) : NaN;
  };
  const decOf = (s: string) => (s.includes(decimal) ? s.split(decimal).pop()!.length : 0);
  const values = [num(m[2]), ...(m[4] ? [num(m[4])] : [])];
  if (values.some(Number.isNaN)) return null;
  return { pre: m[1], values, sep: m[3] ?? '', post: m[5], decimals: Math.max(decOf(m[2]), m[4] ? decOf(m[4]) : 0), thousands, decimal };
}
export function formatLike(f: Formatted, k: number): string {
  const one = (v: number) => {
    const neg = v < 0;
    const [i, d] = Math.abs(v * k).toFixed(f.decimals).split('.');
    const int = i.replace(/\B(?=(\d{3})+(?!\d))/g, f.thousands);
    return `${neg ? '−' : ''}${int}${d ? f.decimal + d : ''}`;
  };
  return f.pre + f.values.map(one).join(f.sep) + f.post;
}
