import { useRef } from 'react';
import type { ChartBlock, Tone } from '../types';
import { Cite, R } from '../lib/rich';
import { sources } from '../content';
import { fmt } from '../lib/format';
import { toneHex } from '../lib/tone';
import { EASE, gsap, useGSAP } from '../motion/gsap';
import { reducedMotion } from '../lib/pointer';

const CYCLE: Tone[] = ['accent', 'cool', 'alert', 'ink', 'muted'];
const W = 820;

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

function Legend({ items }: { items: { name: string; color: string; value?: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[15px] text-ink/80">
      {items.map((it) => (
        <span key={it.name} className="flex items-center gap-2">
          <span className="inline-block h-[10px] w-[10px] rounded-full" style={{ background: it.color }} />
          {it.name}
          {it.value && <span className="text-muted">{it.value}</span>}
        </span>
      ))}
    </div>
  );
}

/** Theme-aware SVG charts with draw-in motion. No chart library. */
export function Chart({ block }: { block: ChartBlock }) {
  const ref = useRef<HTMLDivElement>(null);
  const H = block.height ?? 300;
  const d = block.decimals ?? 0;
  const color = (i: number) => toneHex(block.series[i]?.tone ?? CYCLE[i % CYCLE.length]);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const q = gsap.utils.selector(ref);
      q('.ch-line').forEach((p: Element, i: number) => {
        const len = (p as SVGPathElement).getTotalLength();
        gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.4, delay: 0.45 + i * 0.15, ease: EASE.inOut });
      });
      gsap.from(q('.ch-area'), { opacity: 0, duration: 1, delay: 0.9 });
      gsap.from(q('.ch-dot'), { scale: 0, transformOrigin: 'center', transformBox: 'fill-box', duration: 0.4, stagger: 0.03, delay: 1.2 });
      gsap.from(q('.ch-bar'), { scaleY: 0, transformOrigin: '50% 100%', transformBox: 'fill-box', duration: 0.9, stagger: 0.04, delay: 0.45, ease: EASE.expo });
      q('.ch-seg').forEach((c: Element, i: number) => {
        const target = (c as SVGCircleElement).getAttribute('stroke-dasharray')!;
        const circ = target.split(' ')[1];
        gsap.fromTo(c, { attr: { 'stroke-dasharray': `0 ${circ}` } }, { attr: { 'stroke-dasharray': target }, duration: 1, delay: 0.45 + i * 0.12, ease: EASE.out });
      });
    },
    { scope: ref },
  );

  if (block.kind === 'donut') {
    const s = block.series[0];
    const total = s.values.reduce((a, b) => a + b, 0) || 1;
    const r = 110;
    const C = 2 * Math.PI * r;
    let acc = 0;
    const segs = s.values.map((v, i) => {
      const len = (v / total) * C;
      const seg = { len, off: acc, color: toneHex(CYCLE[i % CYCLE.length]) };
      acc += len;
      return seg;
    });
    return (
      <div ref={ref} data-anim="item" className="flex items-center gap-10">
        <svg viewBox="0 0 300 300" style={{ width: H, height: H }} className="shrink-0 -rotate-90">
          <circle cx="150" cy="150" r={r} fill="none" stroke="var(--c-line)" strokeWidth="34" />
          {segs.map((g, i) => (
            <circle key={i} className="ch-seg" cx="150" cy="150" r={r} fill="none" stroke={g.color} strokeWidth="34" strokeDasharray={`${Math.max(0, g.len - 2)} ${C}`} strokeDashoffset={-g.off} />
          ))}
        </svg>
        <div className="flex min-w-0 flex-col gap-4">
          {block.labels.map((l, i) => (
            <div key={l} className="flex items-baseline gap-4">
              <span className="font-mono text-[34px] font-semibold leading-none" style={{ color: segs[i]?.color }}>
                {fmt((s.values[i] / total) * 100, d)}%
              </span>
              <span className="text-[19px] leading-snug text-ink/80">{l}</span>
            </div>
          ))}
          {block.caption && <p className="font-mono text-[14px] text-muted"><R text={block.caption} /></p>}
        </div>
      </div>
    );
  }

  const padL = 64;
  const padB = 36;
  const padT = 14;
  const plotW = W - padL - 16;
  const plotH = H - padB - padT;
  const n = block.labels.length;
  const stacked = block.kind === 'stacked';
  const max = niceMax(
    stacked
      ? Math.max(...block.labels.map((_, i) => block.series.reduce((a, s) => a + (s.values[i] ?? 0), 0)))
      : Math.max(...block.series.flatMap((s) => s.values)),
  );
  const x = (i: number) => padL + (stacked ? (plotW / n) * (i + 0.5) : n === 1 ? plotW / 2 : (plotW * i) / (n - 1));
  const y = (v: number) => padT + plotH - (v / max) * plotH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);

  return (
    <div ref={ref} data-anim="item" className="flex flex-col gap-3">
      {block.series.length > 1 && <Legend items={block.series.map((s, i) => ({ name: s.name, color: color(i) }))} />}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" style={{ height: H }}>
        {ticks.map((tk) => (
          <g key={tk}>
            <line x1={padL} x2={W - 16} y1={y(tk)} y2={y(tk)} stroke="var(--c-line)" strokeWidth="1" />
            <text x={padL - 10} y={y(tk) + 5} textAnchor="end" fill="var(--c-muted)" fontFamily="var(--f-mono)" fontSize="14">
              {fmt(tk, d)}
            </text>
          </g>
        ))}
        {block.labels.map((l, i) => (
          <text key={l + i} x={x(i)} y={H - 8} textAnchor="middle" fill="var(--c-muted)" fontFamily="var(--f-mono)" fontSize="14">
            {l}
          </text>
        ))}
        {stacked
          ? block.labels.map((_, i) => {
              let base = 0;
              const bw = Math.min(64, (plotW / n) * 0.55);
              return block.series.map((s, si) => {
                const v = s.values[i] ?? 0;
                const el = <rect key={`${i}-${si}`} className="ch-bar" x={x(i) - bw / 2} y={y(base + v)} width={bw} height={Math.max(0, y(base) - y(base + v))} fill={color(si)} />;
                base += v;
                return el;
              });
            })
          : block.series.map((s, si) => {
              const pts = s.values.map((v, i) => `${x(i)},${y(v)}`);
              const line = `M${pts.join(' L')}`;
              const area = `${line} L${x(s.values.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
              const last = s.values.length - 1;
              return (
                <g key={s.name}>
                  {block.kind === 'area' && <path className="ch-area" d={area} fill={color(si)} opacity={0.16} />}
                  <path className="ch-line" d={line} fill="none" stroke={color(si)} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
                  {s.values.map((v, i) => (
                    <circle key={i} className="ch-dot" cx={x(i)} cy={y(v)} r={i === last ? 6 : 4} fill={i === last ? color(si) : 'var(--c-bg)'} stroke={color(si)} strokeWidth="2.5" />
                  ))}
                  <text x={x(last) + 10} y={y(s.values[last]) - 10} fill={color(si)} fontFamily="var(--f-mono)" fontSize="17" fontWeight="600">
                    {fmt(s.values[last], d)}
                    {block.unit ? ` ${block.unit}` : ''}
                  </text>
                </g>
              );
            })}
      </svg>
      {block.caption && <p className="font-mono text-[14px] text-muted"><R text={block.caption} /></p>}
      {block.source && (
        <p className="font-mono text-[13px] text-muted">
          ↳ <Cite id={block.source}>{sources.find((s) => s.id === block.source)?.short ?? block.source}</Cite>
        </p>
      )}
    </div>
  );
}
