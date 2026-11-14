import { useRef } from 'react';
import { itemBeat } from '../deck/beats';
import type { BarsBlock, TableBlock } from '../types';
import { R } from '../lib/rich';
import { fmt } from '../lib/format';
import { toneBg, toneText } from '../lib/tone';
import { EASE, gsap, useGSAP } from '../motion/gsap';
import { reducedMotion } from '../lib/pointer';

/** Matrix table — rows reveal in sequence, optional highlighted column and row tones. */
export function Table({ block }: { block: TableBlock }) {
  const cols = block.columns.length;
  const grid = { gridTemplateColumns: `minmax(0,1.1fr) repeat(${cols - 1}, minmax(0,1fr))` };
  return (
    <div className="flex flex-col">
      <div data-anim="item" className="hairline grid gap-6 border-b pb-3" style={grid}>
        {block.columns.map((c, i) => (
          <div key={i} className={`eyebrow text-[14px] ${i === block.highlightCol ? 'text-accent' : 'text-muted'}`}><R text={c} /></div>
        ))}
      </div>
      {block.rows.map((r, ri) => {
        const tone = block.rowTones?.[ri];
        return (
          <div key={ri} data-anim="item" data-beat={itemBeat(block, ri) || undefined} className="hairline relative grid gap-6 border-b py-4" style={grid}>
            {tone && <span className={`absolute -left-5 top-4 bottom-4 w-[3px] ${toneBg[tone]}`} />}
            {r.map((cell, ci) => (
              <div
                key={ci}
                className={`text-[19px] leading-snug ${ci === 0 ? 'font-semibold text-ink' : 'text-ink/75'} ${ci === block.highlightCol ? '!text-ink bg-accent/8 px-3' : ''} ${ci === 0 && tone ? toneText[tone] : ''}`}
              >
                <R text={cell} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/** Horizontal bar chart (DOM/SVG-free, crisp at any scale). Bars grow on enter. */
export function Bars({ block }: { block: BarsBlock }) {
  const ref = useRef<HTMLDivElement>(null);
  const max = Math.max(...block.items.map((i) => i.value)) || 1;
  useGSAP(
    () => {
      const bars = gsap.utils.toArray<HTMLElement>('.bar-fill', ref.current);
      if (reducedMotion()) return;
      gsap.from(bars, { scaleX: 0, transformOrigin: '0 50%', duration: 1.3, stagger: 0.1, delay: 0.5, ease: EASE.expo });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className="flex flex-col gap-4">
      {block.items.map((it, i) => (
        <div key={i} data-anim="item" className="grid items-center gap-5" style={{ gridTemplateColumns: '260px 1fr 140px' }}>
          <div className="text-[19px] leading-tight text-ink/85"><R text={it.label} /></div>
          <div className="h-[26px] bg-ink/6">
            <div className={`bar-fill h-full ${toneBg[it.tone ?? 'accent']}`} style={{ width: `${(it.value / max) * 100}%` }} />
          </div>
          <div className={`text-right font-mono text-[22px] font-semibold ${toneText[it.tone ?? 'accent']}`}>
            {fmt(it.value, block.decimals ?? 0)}
            {block.unit && <span className="ml-1 text-[14px] text-muted">{block.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
