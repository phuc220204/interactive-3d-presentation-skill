import { useEffect, useMemo, useRef, useState } from 'react';
import type { SimulationBlock, Tone } from '../types';
import { R, plain } from '../lib/rich';
import { fmt } from '../lib/format';
import { toneHex } from '../lib/tone';
import { compileFn } from '../lib/expr';
import { EASE, gsap } from '../motion/gsap';
import { reducedMotion } from '../lib/pointer';

const CYCLE: Tone[] = ['accent', 'alert', 'cool', 'ink'];

/**
 * What-if model the presenter can drag live. Outputs are safe formulas of x (same grammar as plot.fn).
 * The slider sits inside an interactive element, so dragging it never advances the slide.
 */
export function Simulation({ block }: { block: SimulationBlock }) {
  const { min, max } = block.input;
  const step = block.input.step ?? (max - min) / 100;
  const start = block.input.value ?? (min + max) / 2;
  const fns = useMemo(
    () =>
      block.outputs.map((o) => {
        try {
          const f = compileFn(o.fn);
          return (x: number) => {
            const v = f(x, 0);
            return Number.isFinite(v) ? v : 0;
          };
        } catch (e) {
          console.warn('[deck] simulation formula invalid:', o.fn, e);
          return () => 0;
        }
      }),
    [block.outputs],
  );
  // bar scale = largest |output| over the input range
  const scale = useMemo(() => {
    let m = 0;
    for (let k = 0; k <= 50; k++) for (const f of fns) m = Math.max(m, Math.abs(f(min + ((max - min) * k) / 50)));
    return m || 1;
  }, [fns, min, max]);

  const [x, setX] = useState(block.autoplay && !reducedMotion() ? min : start);
  const tween = useRef<gsap.core.Tween | null>(null);
  useEffect(() => {
    if (!block.autoplay || reducedMotion()) return;
    const z = { v: min };
    tween.current = gsap.to(z, { v: start, duration: 2.6, delay: 0.8, ease: EASE.inOut, onUpdate: () => setX(Math.round(z.v / step) * step) });
    return () => {
      tween.current?.kill();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const values = fns.map((f) => f(x));
  const viz = block.viz ?? 'bars';
  const tilt = viz === 'balance' && values.length >= 2 ? Math.max(-18, Math.min(18, ((values[0] - values[1]) / (Math.abs(values[0]) + Math.abs(values[1]) || 1)) * 22)) : 0;

  return (
    <figure data-anim="item" data-interactive className="card flex flex-col gap-6 p-7">
      <label className="flex flex-col gap-3">
        <span className="flex items-baseline justify-between gap-4 text-[19px] text-ink/85">
          <R text={block.input.label} />
          <span className="font-mono text-[30px] font-semibold text-ink">
            {fmt(x, step < 1 ? Math.min(2, String(step).split('.')[1]?.length ?? 1) : 0)}
            {block.input.unit && <span className="ml-1 text-[0.6em] text-muted">{block.input.unit}</span>}
          </span>
        </span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={x}
          aria-label={plain(block.input.label)}
          onPointerDown={() => tween.current?.kill()}
          // give keys back to the deck after a drag (→ / Space / clicker must keep moving slides)
          onPointerUp={(e) => e.currentTarget.blur()}
          onChange={(e) => setX(Number(e.target.value))}
          className="sim-range w-full"
        />
      </label>

      {viz === 'balance' && values.length >= 2 && (
        <svg viewBox="0 0 400 150" className="mx-auto w-[420px]" aria-hidden="true">
          <path d="M200 140 L180 150 H220 Z" fill="var(--c-ink)" opacity={0.6} />
          <line x1={200} y1={60} x2={200} y2={140} stroke="var(--c-ink)" strokeWidth={3} opacity={0.6} />
          <g style={{ transform: `rotate(${-tilt}deg)`, transformOrigin: '200px 60px', transition: 'transform 0.35s ease-out' }}>
            <line x1={40} y1={60} x2={360} y2={60} stroke="var(--c-ink)" strokeWidth={4} strokeLinecap="round" />
            {[0, 1].map((k) => (
              <g key={k} style={{ transform: `rotate(${tilt}deg)`, transformOrigin: `${k ? 360 : 40}px 60px`, transition: 'transform 0.35s ease-out' }}>
                <line x1={k ? 360 : 40} y1={60} x2={k ? 360 : 40} y2={92} stroke="var(--c-ink)" strokeWidth={1.5} opacity={0.6} />
                <path d={`M${(k ? 360 : 40) - 34} 92 h68 l-10 16 h-48 z`} fill={toneHex(block.outputs[k].tone ?? CYCLE[k])} opacity={0.85} />
              </g>
            ))}
          </g>
        </svg>
      )}

      <div className="flex flex-col gap-4">
        {block.outputs.map((o, i) => {
          const col = toneHex(o.tone ?? CYCLE[i % CYCLE.length]);
          const v = values[i];
          return (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[18px] text-ink/80"><R text={o.label} /></span>
                <span className="font-mono text-[28px] font-semibold" style={{ color: col }}>
                  {fmt(v, o.decimals ?? 0)}
                  {o.unit && <span className="ml-1 text-[0.6em] text-muted">{o.unit}</span>}
                </span>
              </div>
              {viz === 'bars' && (
                <div className="h-[10px] w-full overflow-hidden rounded-full" style={{ background: 'color-mix(in srgb, var(--c-ink) 10%, transparent)' }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, (Math.abs(v) / scale) * 100)}%`, background: col, transition: 'width 0.25s ease-out' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {block.caption && <figcaption className="text-[16px] text-muted"><R text={block.caption} /></figcaption>}
    </figure>
  );
}
