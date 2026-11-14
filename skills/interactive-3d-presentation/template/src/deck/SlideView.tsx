import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useBeat } from './beatContext';
import { EASE, gsap } from '../motion/gsap';
import { reducedMotion } from '../lib/pointer';
import type { Slide } from '../types';
import { useSlideEnter } from '../motion/useSlideEnter';
import { SlideLayout } from '../layouts/SlideLayout';
import { checkOverflow } from './devApi';
import { Overlays } from './Overlays';

export function SlideView({ slide, index }: { slide: Slide; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const beat = useBeat();
  const mounted = useRef(false);

  // Item-level beats ([data-beat] from stepwise blocks): hidden until their beat. Runs before the enter timeline.
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = [...root.querySelectorAll<HTMLElement>('[data-beat]')];
    for (const el of els) {
      const on = beat >= Number(el.dataset.beat);
      if (!mounted.current || reducedMotion()) gsap.set(el, { autoAlpha: on ? 1 : 0, y: on ? 0 : 16 });
      else gsap.to(el, { autoAlpha: on ? 1 : 0, y: on ? 0 : 16, duration: on ? 0.6 : 0.25, ease: on ? EASE.out : EASE.in, overwrite: true });
    }
    mounted.current = true;
  }, [beat]);

  useSlideEnter(ref);
  const [overflow, setOverflow] = useState<string[]>([]);

  // Dev-only guard: flag clipped content so the author (human or AI) fixes density, never scrolls.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const t = window.setTimeout(() => {
      const o = checkOverflow();
      setOverflow(o);
      if (o.length) console.warn(`[deck] overflow on slide ${index + 1} (${slide.id}):`, o.join(', '));
    }, 1600);
    return () => window.clearTimeout(t);
  }, [index, slide.id]);

  return (
    <section
      ref={ref}
      className="absolute inset-0 overflow-hidden"
      data-slide={slide.id}
      aria-roledescription="slide"
      aria-label={`${index + 1}`}
    >
      <SlideLayout slide={slide} index={index} />
      <Overlays slide={slide} sectionRef={ref} />
      {overflow.length > 0 && (
        <div className="absolute top-[64px] left-1/2 z-50 -translate-x-1/2 bg-alert px-4 py-2 font-mono text-[16px] text-white">
          ⚠ OVERFLOW · {overflow.join(' · ')} — reduce text or switch layout
        </div>
      )}
    </section>
  );
}
