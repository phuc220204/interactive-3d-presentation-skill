import { useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { itemBeat } from '../deck/beats';
import type { BentoBlock } from '../types';
import { R } from '../lib/rich';
import { toneBg, toneText } from '../lib/tone';

/** Bento grid for multi-stakeholder breakdowns. Cards with `detail` expand on click (Q&A). */
export function Bento({ block, wide }: { block: BentoBlock; wide?: boolean }) {
  const cols = block.columns ?? (wide ? Math.min(4, block.items.length) : 2);
  const [open, setOpen] = useState<number | null>(null);
  const [grid] = useAutoAnimate<HTMLDivElement>({ duration: 350 }); // neighbours glide when a card expands
  return (
    <div ref={grid} className="grid gap-5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
      {block.items.map((it, i) => {
        const tone = it.tone ?? 'ink';
        const isOpen = open === i;
        return (
          <button
            key={i}
            type="button"
            data-anim="item"
            data-beat={itemBeat(block, i) || undefined}
            onClick={() => it.detail && setOpen(isOpen ? null : i)}
            className={`card group relative flex flex-col gap-3 overflow-hidden p-6 text-left transition-colors duration-300 ${it.detail ? 'cursor-pointer hover:bg-bg2/80' : 'cursor-default'}`}
            style={{ gridColumn: it.span === 2 ? 'span 2' : undefined }}
          >
            <span className={`absolute left-0 top-0 h-full w-[3px] ${toneBg[tone]} opacity-80`} />
            <div className="flex items-center justify-between">
              <span className={`eyebrow text-[14px] ${toneText[tone === 'ink' ? 'muted' : tone]}`}>{it.tag ?? (it.value ? '' : String(i + 1).padStart(2, '0'))}</span>
              {it.detail && <span className="font-mono text-[18px] text-muted transition-transform duration-300 group-hover:text-ink" style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}>+</span>}
            </div>
            {it.value && <div className={`font-mono text-[46px] font-semibold leading-none ${toneText[tone === 'ink' ? 'accent' : tone]}`}>{it.value}</div>}
            <h3 className="text-[24px] font-semibold leading-tight text-ink"><R text={it.title} /></h3>
            {it.body && <p className="text-[18px] leading-snug text-ink/70"><R text={it.body} /></p>}
            {it.detail && (
              <div className="grid transition-[grid-template-rows] duration-500 ease-out" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
                <p className="overflow-hidden text-[17px] leading-snug text-ink/85"><span className="hairline mt-2 block border-t pt-3"><R text={it.detail} /></span></p>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
