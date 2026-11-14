import { useRef, type ReactNode } from 'react';
import type { MetricBlock, MetricItem } from '../types';
import { Cite, R } from '../lib/rich';
import { fmt } from '../lib/format';
import { toneText } from '../lib/tone';
import { EASE, gsap, useGSAP } from '../motion/gsap';
import { reducedMotion } from '../lib/pointer';

/** Kinetic number: counts up from 0 when the slide enters. */
export function Counter({ item, className }: { item: MetricItem; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const d = item.decimals ?? 0;
    if (reducedMotion()) {
      el.textContent = fmt(item.value, d);
      return;
    }
    const o = { v: 0 };
    gsap.to(o, {
      v: item.value,
      duration: 1.4,
      delay: 0.35,
      ease: EASE.out,
      onUpdate: () => (el.textContent = fmt(o.v, d)),
    });
  }, []);
  return (
    <span className={className}>
      {item.prefix}
      <span ref={ref}>{fmt(0, item.decimals ?? 0)}</span>
      {item.suffix && <span className="ml-1 text-[0.42em] font-normal tracking-normal opacity-80">{item.suffix}</span>}
    </span>
  );
}

const Cited = ({ id, children }: { id?: string; children: ReactNode }) => (id ? <Cite id={id}>{children}</Cite> : <>{children}</>);

export function Metric({ block, wide }: { block: MetricBlock; wide?: boolean }) {
  const [first, ...rest] = block.items;
  if (block.hero && first) {
    return (
      <div className="flex flex-col gap-8">
        <div data-anim="item">
          <Cited id={first.source}>
            <Counter item={first} className={`font-mono text-[150px] font-semibold leading-none tracking-[-0.04em] ${toneText[first.tone ?? 'accent']}`} />
          </Cited>
          <div className="mt-4 max-w-[720px] text-[24px] leading-snug text-ink/85"><R text={first.label} /></div>
          {first.note && <div className="mt-2 font-mono text-[15px] text-muted"><R text={first.note} /></div>}
        </div>
        {rest.length > 0 && <MetricRow items={rest} wide={wide} />}
      </div>
    );
  }
  return <MetricRow items={block.items} wide={wide} />;
}

function MetricRow({ items, wide }: { items: MetricItem[]; wide?: boolean }) {
  const size = items.length === 1 ? 'text-[120px]' : items.length === 2 ? 'text-[88px]' : wide ? 'text-[80px]' : 'text-[60px]';
  return (
    <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0,1fr))` }}>
      {items.map((it, i) => (
        <div key={i} data-anim="item" className="hairline border-t pt-5">
          <Cited id={it.source}>
            <Counter item={it} className={`font-mono font-semibold leading-none tracking-[-0.03em] ${size} ${toneText[it.tone ?? 'accent']}`} />
          </Cited>
          <div className="mt-3 text-[20px] leading-snug text-ink/80"><R text={it.label} /></div>
          {it.note && <div className="mt-2 font-mono text-[14px] text-muted"><R text={it.note} /></div>}
        </div>
      ))}
    </div>
  );
}
