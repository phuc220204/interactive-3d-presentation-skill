import { useState } from 'react';
import type { CompareBlock, CompareSide } from '../types';
import { R } from '../lib/rich';
import { toneBg, toneText } from '../lib/tone';

const GLYPH = { vs: '⟷', and: '+', to: '→' } as const;

/**
 * Balanced tension cards. Hovering / clicking a side brings it forward and dims the other —
 * useful to "walk" the audience through each side.
 */
export function Compare({ block }: { block: CompareBlock }) {
  const [focus, setFocus] = useState<null | 'l' | 'r'>(null);
  const side = (s: CompareSide, key: 'l' | 'r', fallback: 'accent' | 'alert') => {
    const tone = s.tone ?? fallback;
    const dim = focus !== null && focus !== key;
    // data-anim lives on the wrapper so GSAP (enter/exit) and the CSS hover transition never fight
    return (
      <div data-anim="item" className="flex">
      <button
        type="button"
        onMouseEnter={() => setFocus(key)}
        onMouseLeave={() => setFocus(null)}
        onClick={() => setFocus((f) => (f === key ? null : key))}
        className={`card relative flex w-full flex-col gap-4 p-7 text-left transition-[opacity,transform] duration-500 ${dim ? 'opacity-35' : 'opacity-100'} ${focus === key ? '-translate-y-1' : ''}`}
      >
        <span className={`absolute left-0 right-0 top-0 h-[3px] ${toneBg[tone]}`} />
        {s.tag && <span className={`eyebrow text-[14px] ${toneText[tone]}`}>{s.tag}</span>}
        <h3 className="font-display text-[34px] font-bold leading-tight text-ink"><R text={s.title} /></h3>
        <ul className="flex flex-col gap-3">
          {s.points.map((p, i) => (
            <li key={i} className="flex gap-3 text-[20px] leading-snug text-ink/80">
              <span className={`mt-[11px] h-[6px] w-[6px] shrink-0 ${toneBg[tone]}`} />
              <span><R text={p} /></span>
            </li>
          ))}
        </ul>
      </button>
      </div>
    );
  };
  return (
    <div className="flex flex-col gap-5">
      <div className="relative grid grid-cols-2 gap-6">
        {side(block.left, 'l', 'accent')}
        {side(block.right, 'r', 'alert')}
        <div data-anim="item" className="pointer-events-none absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border hairline bg-bg font-mono text-[22px] text-ink">
          {GLYPH[block.relation ?? 'vs']}
        </div>
      </div>
      {block.verdict && (
        <div data-anim="item" className="hairline border-l-2 !border-l-accent bg-accent/8 px-6 py-4 text-[21px] leading-snug text-ink">
          <R text={block.verdict} />
        </div>
      )}
    </div>
  );
}
