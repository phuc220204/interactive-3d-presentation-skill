import { useEffect, useRef } from 'react';
import type { MorphScene, Slide } from '../types';
import { useBeat } from './beatContext';
import { sceneAt } from './beats';
import { pathPoints, shapePoints } from '../lib/morphPoints';
import { theme } from '../content';
import { toneHex } from '../lib/tone';
import { EASE, gsap } from '../motion/gsap';
import { elbow, maskDraw } from '../motion/draw';
import { reducedMotion } from '../lib/pointer';

const CW = 330;
const CH = 230;
const GAP = 46;

/** Is the morph scene of this slide, at this beat, asking for its stage summary? */
export function morphSummaryOn(slide: Slide, beat: number) {
  const sc = sceneAt(slide, beat);
  return sc.name === 'morph' && !!(sc as MorphScene).state.summary && !!(sc as MorphScene).state.stages?.length;
}

/** Draw a stage's point cloud flat (x, y) into a canvas. */
function paint(canvas: HTMLCanvasElement, pts: Float32Array, color: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = 2;
  canvas.width = CW * dpr;
  canvas.height = CH * dpr;
  ctx.scale(dpr, dpr);
  ctx.fillStyle = color;
  const s = Math.min(CW, CH) / 5.2;
  for (let i = 0; i < pts.length; i += 3 * 3) {
    const x = CW / 2 + pts[i] * s;
    const y = CH / 2 - pts[i + 1] * s;
    ctx.globalAlpha = 0.35 + 0.4 * ((i / 3) % 7) / 7;
    ctx.fillRect(x, y, 1.6, 1.6);
  }
}

/**
 * morph.state.summary (usually switched on by the last entry of slide.sceneBeats): the stages of the morph appear
 * side by side as a 2×2 grid of flat point drawings with arrows — "where we came from" in one glance.
 * The live 3D cloud dims behind it (three/Stage.tsx).
 */
export function MorphSummary({ slide }: { slide: Slide }) {
  const beat = useBeat();
  const on = morphSummaryOn(slide, beat);
  const root = useRef<HTMLDivElement>(null);
  const arrows = useRef<SVGSVGElement>(null);
  const stages = on ? ((sceneAt(slide, beat) as MorphScene).state.stages ?? []).slice(0, 4) : [];
  const layout = slide.layout ?? 'split';
  const left = layout === 'split-right' ? 128 : layout === 'split' || layout === 'cover' ? 1032 : 960 - CW - GAP / 2;
  const cols = 2;
  const W = cols * CW + GAP;
  const H = Math.ceil(stages.length / cols) * (CH + 44) + GAP;

  useEffect(() => {
    const el = root.current;
    const svg = arrows.current;
    if (!on || !el || !svg) return;
    el.querySelectorAll('canvas').forEach((c, i) => {
      const st = stages[i];
      paint(c, st.path ? pathPoints(st.path) : shapePoints(st.shape ?? 'scatter'), i === stages.length - 1 ? toneHex('accent') : theme.colors.ink);
    });
    svg.replaceChildren();
    const live: (gsap.core.Tween | gsap.core.Timeline | null)[] = [];
    const cells = [...el.querySelectorAll<HTMLElement>('.ms-cell')];
    const box = (c: HTMLElement) => ({ x: c.offsetLeft, y: c.offsetTop, w: c.offsetWidth, h: c.offsetHeight - 40 });
    const paths = cells.slice(1).map((c, i) => {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', elbow(box(cells[i]), box(c), 16));
      p.setAttribute('class', 'ms-arrow');
      p.setAttribute('marker-end', 'url(#ms-head)');
      svg.appendChild(p);
      return p;
    });
    if (!reducedMotion()) {
      // fromTo (not from): a re-run (StrictMode, beat change) must always end fully visible
      live.push(gsap.fromTo(cells, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.55, stagger: 0.32, ease: 'back.out(1.6)', delay: 0.2 }));
      paths.forEach((p, i) => live.push(maskDraw(p, { delay: 0.55 + i * 0.32, duration: 0.45, cover: 20 })));
    }
    return () => {
      live.forEach((t) => t?.kill());
      gsap.set(cells, { clearProps: 'opacity,transform' });
    };
  }, [on, stages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!on) return null;
  return (
    <div ref={root} className="morph-summary absolute" style={{ left, top: Math.max(150, 540 - H / 2), width: W, height: H }} aria-label="stage summary">
      <svg ref={arrows} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <defs>
          <marker id="ms-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" fill={toneHex('accent')} />
          </marker>
        </defs>
      </svg>
      {stages.map((st, i) => (
        <figure key={i} className="ms-cell absolute flex flex-col items-center" style={{ left: (i % cols) * (CW + GAP), top: Math.floor(i / cols) * (CH + 44 + GAP / 2), width: CW }}>
          <canvas className="card" style={{ width: CW, height: CH }} />
          <figcaption className="mt-2 font-mono text-[15px] tracking-[0.08em] text-ink/80 uppercase">
            {i + 1} · {st.label ?? st.shape}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
void EASE;
