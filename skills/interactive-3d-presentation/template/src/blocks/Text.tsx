import { useRef } from 'react';
import type { CalloutBlock, ListBlock, QuoteBlock } from '../types';
import { EASE, gsap, useGSAP } from '../motion/gsap';
import { reducedMotion } from '../lib/pointer';
import { itemBeat } from '../deck/beats';
import { R } from '../lib/rich';
import { toneBg, toneBorder, toneText } from '../lib/tone';

/** Types every text node of `root` out in order (markup is kept), with a blinking caret. */
function typeOut(root: HTMLElement, cps = 38, delay = 0.6) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: { n: Text; full: string }[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push({ n: n as Text, full: (n as Text).data });
  const total = nodes.reduce((a, x) => a + x.full.length, 0);
  nodes.forEach((x) => (x.n.data = ''));
  const caret = document.createElement('span');
  caret.className = 'type-caret';
  root.appendChild(caret);
  const z = { c: 0 };
  const tween = gsap.to(z, {
    c: total,
    duration: total / cps,
    delay,
    ease: 'none',
    onUpdate: () => {
      let left = Math.floor(z.c);
      for (const x of nodes) {
        const k = Math.min(left, x.full.length);
        x.n.data = x.full.slice(0, k);
        left -= k;
      }
    },
    onComplete: () => window.setTimeout(() => caret.remove(), 1600),
  });
  return () => {
    tween.kill();
    caret.remove();
    nodes.forEach((x) => (x.n.data = x.full));
  };
}

export function Quote({ block }: { block: QuoteBlock }) {
  const ref = useRef<HTMLQuoteElement>(null);
  useGSAP(() => {
    if (!block.typing || reducedMotion() || !ref.current) return;
    return typeOut(ref.current);
  }, []);
  return (
    <figure data-anim="item" className="relative max-w-[1300px]">
      <span aria-hidden className="block h-[56px] font-display text-[120px] leading-[1] text-accent/60">“</span>
      <blockquote ref={ref} className="relative font-display text-[44px] font-semibold italic leading-[1.25] text-ink [text-wrap:balance]">
        <R text={block.text} />
      </blockquote>
      {(block.author || block.role) && (
        <figcaption className="mt-6 flex items-center gap-4 [.text-center_&]:justify-center font-mono text-[17px] tracking-[0.1em] text-muted uppercase">
          <span className="h-px w-12 bg-accent" />
          <span className="text-ink">{block.author}</span>
          {block.role && <span>· {block.role}</span>}
        </figcaption>
      )}
    </figure>
  );
}

export function Callout({ block }: { block: CalloutBlock }) {
  const tone = block.tone ?? 'accent';
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (block.style !== 'stamp' || reducedMotion() || !ref.current) return;
    gsap
      .timeline({ delay: 0.7 })
      .fromTo(ref.current, { scale: 2.3, rotation: -18, opacity: 0 }, { scale: 1, rotation: -3, opacity: 1, duration: 0.42, ease: 'power4.in' })
      .to(ref.current, { x: 5, duration: 0.05, repeat: 5, yoyo: true, ease: EASE.inOut })
      .set(ref.current, { x: 0 });
  }, []);
  if (block.style === 'stamp')
    return (
      <div ref={ref} className={`stamp w-fit max-w-[900px] px-7 py-4 ${toneText[tone]}`}>
        {block.label && <span className="eyebrow block text-[14px]">{block.label}</span>}
        <p className="font-display text-[30px] uppercase leading-tight"><R text={block.body} /></p>
      </div>
    );
  return (
    <div ref={ref} data-anim="item" className={`card hatch flex flex-col gap-2 px-7 py-5 ${block.style === 'ants' ? 'ants' : `border-l-[3px] ${toneBorder[tone]}`}`}>
      {block.label && <span className={`eyebrow text-[14px] ${toneText[tone]}`}>{block.label}</span>}
      <p className="text-[22px] leading-snug text-ink/90"><R text={block.body} /></p>
    </div>
  );
}

export function List({ block }: { block: ListBlock }) {
  const style = block.style ?? 'bullet';
  return (
    <ul className="flex flex-col">
      {block.items.map((it, i) => (
        <li key={i} data-anim="item" data-beat={itemBeat(block, i) || undefined} className="hairline flex items-baseline gap-5 border-t py-4 text-[22px] leading-snug text-ink/85 last:border-b">
          {style === 'numbered' && <span className="w-9 shrink-0 font-mono text-[17px] text-accent">{String(i + 1).padStart(2, '0')}</span>}
          {style === 'bullet' && <span className={`h-[7px] w-[7px] shrink-0 -translate-y-[3px] ${toneBg.accent}`} />}
          {style === 'check' && <span className="shrink-0 font-mono text-[18px] text-accent">✓</span>}
          <span><R text={it} /></span>
        </li>
      ))}
    </ul>
  );
}
