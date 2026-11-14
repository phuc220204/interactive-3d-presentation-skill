import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useBeat } from './beatContext';
import { EASE, gsap } from '../motion/gsap';
import { reducedMotion } from '../lib/pointer';

/**
 * Hides a block until beat `at`, keeping its space (no layout jump). When the beat is reached the
 * block is re-mounted so its own motion (counters, chart draw, SVG strokes…) plays in front of the audience.
 */
export function BeatGate({ at, children }: { at?: number; children: ReactNode }) {
  const beat = useBeat();
  const shown = !at || beat >= at;
  const [gen, setGen] = useState(0);
  const was = useRef(shown);
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!at) return;
    const el = ref.current;
    if (!el) return;
    if (shown && !was.current) {
      setGen((g) => g + 1); // replay inner motion
      if (reducedMotion()) gsap.set(el, { autoAlpha: 1, y: 0 });
      else gsap.fromTo(el, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: EASE.out });
    } else if (!shown && was.current) {
      gsap.to(el, { autoAlpha: 0, y: 12, duration: 0.3, ease: EASE.in });
    } else if (!shown) {
      gsap.set(el, { autoAlpha: 0 });
    }
    was.current = shown;
  }, [shown, at]);

  if (!at) return <>{children}</>;
  return (
    <div ref={ref} data-beat-gate={at} style={{ visibility: shown ? undefined : 'hidden' }}>
      <div key={gen} className="contents">
        {children}
      </div>
    </div>
  );
}
