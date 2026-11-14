import { useRef } from 'react';
import { slides } from '../content';
import { useDeck } from '../deck/store';
import { plain } from '../lib/rich';
import { t } from '../i18n';
import { EASE, gsap, useGSAP } from '../motion/gsap';

const pad = (n: number) => String(n).padStart(2, '0');

/** Full-screen slide jumper (O / M). Great for Q&A: jump straight to any slide. */
export function Overview() {
  const open = useDeck((s) => s.overview);
  const index = useDeck((s) => s.index);
  const go = useDeck((s) => s.go);
  const toggle = useDeck((s) => s.toggle);
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (open) gsap.from('.ov-card', { opacity: 0, y: 24, duration: 0.5, stagger: 0.025, ease: EASE.out });
    },
    { scope: ref, dependencies: [open] },
  );

  if (!open) return null;
  return (
    <div ref={ref} className="fixed inset-0 z-50 flex flex-col bg-bg/92 p-12 backdrop-blur-xl" onClick={() => toggle('overview', false)}>
      <div className="mb-8 flex items-baseline justify-between font-mono text-[13px] tracking-[0.16em] text-muted uppercase">
        <span>{t('overview')} · {slides.length}</span>
        <span>{t('overviewClose')}</span>
      </div>
      <div data-scrollable className="scroll-thin grid flex-1 auto-rows-min grid-cols-2 gap-4 overflow-y-auto md:grid-cols-4 xl:grid-cols-5">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={(e) => {
              e.stopPropagation();
              go(i);
              toggle('overview', false);
            }}
            className={`ov-card card flex aspect-video flex-col justify-between p-4 text-left transition-colors hover:border-accent ${i === index ? '!border-accent' : ''}`}
          >
            <div className="flex justify-between font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
              <span className={i === index ? 'text-accent' : ''}>{pad(i + 1)}</span>
              <span className="truncate pl-3">{s.section}</span>
            </div>
            <div className="line-clamp-3 font-display text-[17px] leading-tight font-bold text-ink">{plain(s.title)}</div>
            <div className="font-mono text-[10px] tracking-[0.12em] text-muted/70 uppercase">
              {s.layout ?? 'split'} · {s.scene.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
