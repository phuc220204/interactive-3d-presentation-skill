import { useRef, useState } from 'react';
import { itemBeat } from '../deck/beats';
import type { TimelineBlock } from '../types';
import { R } from '../lib/rich';
import { toneBg, toneText } from '../lib/tone';
import { EASE, gsap, useGSAP } from '../motion/gsap';
import { reducedMotion } from '../lib/pointer';

/** Horizontal stepped timeline. Progress rail draws to the active node; click a node to move focus. */
export function Timeline({ block }: { block: TimelineBlock }) {
  const n = block.items.length;
  const [active, setActive] = useState(block.active ?? n - 1);
  const rail = useRef<HTMLDivElement>(null);
  const pct = n > 1 ? (active / (n - 1)) * 100 : 100;

  useGSAP(() => {
    if (!rail.current) return;
    if (reducedMotion()) return void gsap.set(rail.current, { width: `${pct}%` });
    gsap.fromTo(rail.current, { width: '0%' }, { width: `${pct}%`, duration: 1.6, delay: 0.5, ease: EASE.inOut });
  }, []);
  useGSAP(() => {
    if (rail.current) gsap.to(rail.current, { width: `${pct}%`, duration: 0.7, ease: EASE.out });
  }, { dependencies: [pct] });

  return (
    <div className="relative pt-2">
      <div className="relative mx-[11px] h-[2px] bg-ink/15" data-anim="line">
        <div ref={rail} className="absolute left-0 top-0 h-full bg-accent" style={{ width: 0 }} />
      </div>
      <div className="mt-[-13px] grid gap-6" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
        {block.items.map((it, i) => {
          const on = i <= active;
          const tone = it.tone ?? 'accent';
          return (
            <button key={i} type="button" data-anim="item" data-beat={itemBeat(block, i) || undefined} onClick={() => setActive(i)} className="flex flex-col items-start gap-3 text-left">
              <span
                className={`relative h-6 w-6 rounded-full border-2 transition-colors duration-500 ${on ? `${toneBg[tone]} border-transparent` : 'border-ink/30 bg-bg'}`}
              >
                {i === active && <span className={`absolute inset-[-8px] animate-ping rounded-full opacity-30 ${toneBg[tone]}`} />}
              </span>
              <span className={`font-mono text-[22px] font-semibold ${on ? toneText[tone] : 'text-muted'}`}>{it.date}</span>
              <span className={`text-[22px] font-semibold leading-tight transition-colors ${on ? 'text-ink' : 'text-ink/55'}`}><R text={it.title} /></span>
              {it.body && <span className="text-[17px] leading-snug text-ink/65"><R text={it.body} /></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
