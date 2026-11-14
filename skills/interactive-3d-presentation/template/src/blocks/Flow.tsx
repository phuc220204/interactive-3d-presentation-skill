import { Fragment, useRef } from 'react';
import { itemBeat } from '../deck/beats';
import type { FlowBlock } from '../types';
import { R } from '../lib/rich';
import { toneHex, toneText } from '../lib/tone';
import { EASE, gsap, useGSAP } from '../motion/gsap';
import { reducedMotion } from '../lib/pointer';

/** Connected node diagram: step cards joined by animated SVG connectors (stroke draw + flowing dash). */
export function Flow({ block }: { block: FlowBlock }) {
  const col = block.direction === 'column';
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const paths = gsap.utils.toArray<SVGPathElement>('.flow-draw', ref.current);
      paths.forEach((p, i) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: reducedMotion() ? 0 : len });
        if (!reducedMotion()) gsap.to(p, { strokeDashoffset: 0, duration: 0.7, delay: 0.6 + i * 0.22, ease: EASE.inOut });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={`flex ${col ? 'flex-col' : 'flex-row items-stretch'}`}>
      {block.steps.map((s, i) => (
        <Fragment key={i}>
          {col ? (
            // compact horizontal card for vertical flows (fits 4–5 steps in a split column)
            <div data-anim="item" data-beat={itemBeat(block, i) || undefined} className="card relative flex min-w-0 items-baseline gap-5 px-5 py-3">
              <span className={`font-mono text-[15px] tracking-[0.14em] ${toneText[s.tone ?? 'accent']}`}>{String(i + 1).padStart(2, '0')}</span>
              <div className="min-w-0">
                <h3 className="text-[21px] font-semibold leading-tight text-ink"><R text={s.title} /></h3>
                {s.body && <p className="mt-1 text-[16px] leading-snug text-ink/65"><R text={s.body} /></p>}
              </div>
            </div>
          ) : (
            <div data-anim="item" data-beat={itemBeat(block, i) || undefined} className="card relative flex min-w-0 flex-1 flex-col gap-2 p-5">
              <span className={`font-mono text-[15px] tracking-[0.14em] ${toneText[s.tone ?? 'accent']}`}>{String(i + 1).padStart(2, '0')}</span>
              <h3 className="text-[22px] font-semibold leading-tight text-ink"><R text={s.title} /></h3>
              {s.body && <p className="text-[17px] leading-snug text-ink/70"><R text={s.body} /></p>}
            </div>
          )}
          {i < block.steps.length - 1 && (
            <svg
              data-beat={itemBeat(block, i + 1) || undefined}
              className={col ? 'ml-6 h-7 w-6 shrink-0' : 'my-auto h-6 w-12 shrink-0'}
              viewBox={col ? '0 0 24 40' : '0 0 48 24'}
              fill="none"
            >
              {col ? (
                <>
                  <path className="flow-draw" d="M12 2 V34" stroke={toneHex(block.steps[i + 1].tone, 'accent')} strokeWidth="2" />
                  <path className="flow-draw" d="M6 28 L12 36 L18 28" stroke={toneHex(block.steps[i + 1].tone, 'accent')} strokeWidth="2" />
                </>
              ) : (
                <>
                  <path className="flow-draw" d="M2 12 H42" stroke={toneHex(block.steps[i + 1].tone, 'accent')} strokeWidth="2" />
                  <path className="flow-draw" d="M36 6 L44 12 L36 18" stroke={toneHex(block.steps[i + 1].tone, 'accent')} strokeWidth="2" />
                </>
              )}
            </svg>
          )}
        </Fragment>
      ))}
    </div>
  );
}
