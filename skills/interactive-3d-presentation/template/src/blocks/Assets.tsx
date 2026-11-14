import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { DiagramBlock, LottieBlock } from '../types';
import { R } from '../lib/rich';
import { asset } from '../lib/asset';
import { EASE, gsap } from '../motion/gsap';
import { reducedMotion } from '../lib/pointer';

const svgCache = new Map<string, Promise<string>>();
function loadSvg(src: string) {
  if (!svgCache.has(src)) {
    svgCache.set(
      src,
      fetch(asset(src)).then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${src}`);
        return r.text();
      }),
    );
  }
  return svgCache.get(src)!;
}

/** Remove anything executable from an SVG before inlining it. */
const sanitize = (svg: string) =>
  svg
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '');

/**
 * SVG/CSS diagram inlined into the slide so (1) it can use theme colours — write `stroke="var(--c-accent)"`,
 * `fill="currentColor"`, classes `.d-accent` / `.d-alert` / `.d-cool` / `.d-ink` / `.d-muted` — and
 * (2) its strokes draw themselves in order (element order = drawing order).
 */
export function Diagram({ block }: { block: DiagramBlock }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    loadSvg(block.src)
      .then((t) => alive && setSvg(sanitize(t)))
      .catch((e) => {
        console.warn('[deck] diagram failed to load:', block.src, e);
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [block.src]);

  useEffect(() => {
    const host = ref.current;
    if (!host || !svg) return;
    const el = host.querySelector('svg');
    if (!el) return;
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', block.alt);
    el.style.width = '100%';
    el.style.height = '100%';
    if (block.draw === false || reducedMotion()) return;
    const strokes = [...el.querySelectorAll<SVGGeometryElement>('path, line, polyline, polygon, circle, ellipse, rect')].filter(
      (p) => getComputedStyle(p).stroke !== 'none' && typeof p.getTotalLength === 'function',
    );
    const fills = el.querySelectorAll('text, [data-fade]');
    const tl = gsap.timeline({ delay: 0.4 });
    strokes.forEach((p, i) => {
      let len = 0;
      try {
        len = p.getTotalLength();
      } catch {
        return;
      }
      tl.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: Math.min(1.2, 0.35 + len / 900), ease: EASE.inOut }, i * 0.08);
    });
    tl.from(fills, { opacity: 0, y: 6, duration: 0.5, stagger: 0.05 }, '>-0.4');
    return () => {
      tl.kill();
    };
  }, [svg, block.draw, block.alt]);

  return (
    <figure data-anim="item" className="flex flex-col gap-3">
      <div ref={ref} className="diagram relative w-full text-ink" style={{ height: block.height ?? 420 }}>
        {svg && <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: svg }} />}
        {failed && <div className="hairline flex h-full items-center justify-center border border-dashed font-mono text-[15px] text-muted">{block.alt}</div>}
      </div>
      {block.caption && <figcaption className="text-[17px] leading-snug text-muted"><R text={block.caption} /></figcaption>}
    </figure>
  );
}

const DotLottie = lazy(() => import('@lottiefiles/dotlottie-react').then((m) => ({ default: m.DotLottieReact })));

/** Lottie / dotLottie animation (lazy-loaded player). Reduced motion → first frame, no loop. */
export function LottieAsset({ block }: { block: LottieBlock }) {
  const still = reducedMotion();
  return (
    <figure data-anim="item" className="flex flex-col items-center gap-3">
      <div style={{ height: block.height ?? 360, width: '100%' }} role="img" aria-label={block.alt}>
        <Suspense fallback={null}>
          <DotLottie src={asset(block.src)} autoplay={!still} loop={!still && block.loop !== false} style={{ width: '100%', height: '100%' }} />
        </Suspense>
      </div>
      {block.caption && <figcaption className="text-center text-[17px] leading-snug text-muted"><R text={block.caption} /></figcaption>}
    </figure>
  );
}
