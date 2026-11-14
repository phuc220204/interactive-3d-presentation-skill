import { useId, useRef } from 'react';
import type { DimensionBlock, GaugeBlock, Tone, WaffleBlock } from '../types';
import { Cite, R } from '../lib/rich';
import { fmt } from '../lib/format';
import { toneHex } from '../lib/tone';
import { EASE, gsap, useGSAP } from '../motion/gsap';
import { maskDraw } from '../motion/draw';
import { reducedMotion } from '../lib/pointer';

const CYCLE: Tone[] = ['accent', 'cool', 'alert', 'ink'];

/* Cell shapes as CSS masks: the cell keeps its background colour, the mask gives the silhouette. */
const svgUrl = (body: string) => `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>${body}</svg>`)}")`;
const ICONS: Record<NonNullable<WaffleBlock['icon']>, string | null> = {
  square: null,
  circle: svgUrl("<circle cx='12' cy='12' r='10'/>"),
  person: svgUrl("<circle cx='12' cy='5.5' r='4'/><path d='M4 23v-6.5a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5V23z'/>"),
  coin: svgUrl("<circle cx='12' cy='12' r='10.5'/><circle cx='12' cy='12' r='6.5' fill-opacity='0'/>"),
  house: svgUrl("<path d='M12 2 1.5 11H4v11h6v-6h4v6h6V11h2.5z'/>"),
  drop: svgUrl("<path d='M12 1.5C8 7.5 4.5 11.4 4.5 15.2a7.5 7.5 0 0 0 15 0C19.5 11.4 16 7.5 12 1.5z'/>"),
  tree: svgUrl("<path d='M12 1 4 13h4l-4 6h7v4h2v-4h7l-4-6h4z'/>"),
};

const Cited = ({ id, children }: { id?: string; children: React.ReactNode }) => (id ? <Cite id={id}>{children}</Cite> : <>{children}</>);

/** 10 × 10 grid (or `total` cells): each part fills its count of cells, cells pop in one by one. */
export function Waffle({ block }: { block: WaffleBlock }) {
  const ref = useRef<HTMLDivElement>(null);
  const total = block.total ?? 100;
  const cols = total === 100 ? 10 : Math.ceil(Math.sqrt(total));
  const cells: (Tone | null)[] = [];
  block.parts.forEach((p, i) => {
    for (let k = 0; k < Math.round(p.value) && cells.length < total; k++) cells.push(p.tone ?? CYCLE[i % CYCLE.length]);
  });
  while (cells.length < total) cells.push(null);
  const mask = ICONS[block.icon ?? 'square'];

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from(ref.current!.querySelectorAll('.wf-cell'), { scale: 0, opacity: 0, duration: 0.35, ease: 'back.out(2)', stagger: { each: 0.012, from: 'start' }, delay: 0.45 });
    },
    { scope: ref },
  );

  return (
    <figure ref={ref} data-anim="item" className="flex items-center gap-10">
      <div className="grid shrink-0 gap-[6px]" style={{ gridTemplateColumns: `repeat(${cols}, 30px)` }} role="img" aria-label={block.parts.map((p) => `${p.value}/${total}`).join(', ')}>
        {cells.map((t, i) => (
          <span
            key={i}
            className="wf-cell block h-[30px] w-[30px]"
            style={{
              background: t ? toneHex(t) : 'color-mix(in srgb, var(--c-ink) 12%, transparent)',
              ...(mask ? { WebkitMask: `${mask} center / contain no-repeat`, mask: `${mask} center / contain no-repeat` } : { borderRadius: 3 }),
            }}
          />
        ))}
      </div>
      <figcaption className="flex flex-col gap-5">
        {block.parts.map((p, i) => (
          <div key={i}>
            <Cited id={block.source}>
              <span className="font-mono text-[44px] font-semibold leading-none" style={{ color: toneHex(p.tone ?? CYCLE[i % CYCLE.length]) }}>
                {fmt(p.value, 0)}
                <span className="text-[0.5em] text-muted">/{total}</span>
              </span>
            </Cited>
            <div className="mt-1 text-[19px] leading-snug text-ink/85"><R text={p.label} /></div>
          </div>
        ))}
        {block.caption && <div className="text-[16px] text-muted"><R text={block.caption} /></div>}
      </figcaption>
    </figure>
  );
}

/** Ring gauge: arc fills with the ease, 40 ticks light up behind it, optional target marker. */
export function Gauge({ block }: { block: GaugeBlock }) {
  const ref = useRef<HTMLDivElement>(null);
  const R0 = 92;
  const C = 2 * Math.PI * R0;
  useGSAP(
    () => {
      const root = ref.current!;
      root.querySelectorAll<SVGCircleElement>('.g-arc').forEach((arc, gi) => {
        const it = block.items[gi];
        const p = Math.max(0, Math.min(1, it.value / (it.max ?? 100)));
        const num = root.querySelectorAll<HTMLElement>('.g-num')[gi];
        const ticks = [...root.querySelectorAll<SVGLineElement>(`.g-tick-${gi}`)];
        if (reducedMotion()) {
          arc.style.strokeDashoffset = String(C * (1 - p));
          ticks.forEach((t, k) => (t.style.opacity = k / ticks.length < p ? '1' : '0.25'));
          num.textContent = fmt(it.value, it.decimals ?? 0);
          return;
        }
        const z = { f: 0 };
        gsap.to(z, {
          f: 1,
          duration: 1.8,
          delay: 0.45 + gi * 0.15,
          ease: EASE.out,
          onUpdate: () => {
            arc.style.strokeDashoffset = String(C * (1 - p * z.f));
            ticks.forEach((t, k) => (t.style.opacity = k / ticks.length < p * z.f ? '1' : '0.25'));
            num.textContent = fmt(it.value * z.f, it.decimals ?? 0);
          },
        });
      });
    },
    { scope: ref },
  );
  return (
    <figure ref={ref} data-anim="item" className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-center gap-10">
        {block.items.map((it, gi) => {
          const col = toneHex(it.tone ?? CYCLE[gi % CYCLE.length]);
          const tAng = it.target != null ? (it.target / (it.max ?? 100)) * 360 - 90 : null;
          return (
            <div key={gi} className="flex w-[230px] flex-col items-center text-center">
              <div className="relative h-[230px] w-[230px]">
                <svg viewBox="0 0 230 230" className="absolute inset-0">
                  {Array.from({ length: 40 }, (_, k) => {
                    const a = (k / 40) * Math.PI * 2 - Math.PI / 2;
                    return <line key={k} className={`g-tick-${gi}`} x1={115 + Math.cos(a) * 106} y1={115 + Math.sin(a) * 106} x2={115 + Math.cos(a) * 112} y2={115 + Math.sin(a) * 112} stroke={col} strokeWidth={2} style={{ opacity: 0.25 }} />;
                  })}
                  <circle cx={115} cy={115} r={R0} fill="none" stroke="var(--c-line)" strokeWidth={14} />
                  <circle className="g-arc" cx={115} cy={115} r={R0} fill="none" stroke={col} strokeWidth={14} strokeLinecap="round" strokeDasharray={C} style={{ strokeDashoffset: C }} transform="rotate(-90 115 115)" />
                  {tAng != null && (
                    <path d="M0 -7 L6 5 L-6 5 Z" fill="var(--c-ink)" transform={`translate(${115 + Math.cos((tAng * Math.PI) / 180) * 74} ${115 + Math.sin((tAng * Math.PI) / 180) * 74}) rotate(${tAng + 90})`} />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Cited id={it.source}>
                    <span className="font-mono text-[46px] font-semibold leading-none" style={{ color: col }}>
                      <span className="g-num">{fmt(0, it.decimals ?? 0)}</span>
                      <span className="text-[0.45em]">{it.suffix ?? '%'}</span>
                    </span>
                  </Cited>
                </div>
              </div>
              <div className="mt-3 text-[19px] leading-snug text-ink/85"><R text={it.label} /></div>
            </div>
          );
        })}
      </div>
      {block.caption && <figcaption className="text-center text-[16px] text-muted"><R text={block.caption} /></figcaption>}
    </figure>
  );
}

/** Dimension lines (technical drawing): arrowed lines drawn to scale, labels count up. */
export function Dimension({ block }: { block: DimensionBlock }) {
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[^a-z0-9]/gi, '');
  const max = Math.max(...block.items.map((i) => i.value), 1);
  const W = 740;
  useGSAP(
    () => {
      const root = ref.current!;
      const lines = [...root.querySelectorAll<SVGPathElement>('.dim-line')];
      const nums = [...root.querySelectorAll<HTMLElement>('.dim-num')];
      lines.forEach((l, i) => {
        const it = block.items[i];
        const delay = 0.45 + i * 0.3;
        const tw = maskDraw(l, { delay, duration: 1.1, pen: true, cover: 24 });
        if (!tw || it.display) {
          nums[i].textContent = it.display ?? fmt(it.value, 0);
          if (tw) gsap.from(nums[i], { opacity: 0, duration: 0.4, delay: delay + 0.8 });
          return;
        }
        const z = { v: 0 };
        gsap.to(z, { v: it.value, duration: 1.1, delay, ease: EASE.inOut, onUpdate: () => (nums[i].textContent = fmt(z.v, 0)) });
      });
    },
    { scope: ref },
  );
  return (
    <figure ref={ref} data-anim="item" className="flex flex-col gap-5">
      {block.items.map((it, i) => {
        const len = Math.max(24, (it.value / max) * (W - 4));
        const col = toneHex(it.tone ?? 'ink');
        const mid = `dim-${uid}-${i}`;
        return (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex items-baseline gap-3">
              <Cited id={block.source}>
                <span className="font-mono text-[26px] font-semibold leading-none" style={{ color: col }}>
                  <span className="dim-num">{it.display ?? fmt(0, 0)}</span>
                  {!it.display && block.unit && <span className="ml-1 text-[0.65em]">{block.unit}</span>}
                </span>
              </Cited>
              <span className="text-[18px] leading-snug text-ink/80"><R text={it.label} /></span>
            </div>
            <svg viewBox={`0 0 ${W + 4} 28`} className="w-full overflow-visible" style={{ height: 28 }} aria-hidden="true">
              <defs>
                <marker id={mid} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10 Z" fill={col} />
                </marker>
              </defs>
              <line x1={2} y1={2} x2={2} y2={26} stroke={col} strokeWidth={1.2} opacity={0.55} />
              <line x1={2 + len} y1={2} x2={2 + len} y2={26} stroke={col} strokeWidth={1.2} opacity={0.55} />
              <path className="dim-line" d={`M4 14 H${len}`} stroke={col} strokeWidth={2} fill="none" markerStart={`url(#${mid})`} markerEnd={`url(#${mid})`} />
            </svg>
          </div>
        );
      })}
      {block.caption && <figcaption className="text-[16px] text-muted"><R text={block.caption} /></figcaption>}
    </figure>
  );
}
