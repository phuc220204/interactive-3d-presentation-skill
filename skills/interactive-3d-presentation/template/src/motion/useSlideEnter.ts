import type { RefObject } from 'react';
import { EASE, gsap, SplitText, STAGGER, useGSAP } from './gsap';
import { reducedMotion } from '../lib/pointer';

/**
 * Enter choreography for one slide. Elements opt in with data attributes:
 *   data-anim="kicker"  → slides in from the left
 *   data-anim="title"   → SplitText line-mask reveal (re-splits after fonts load / resize)
 *   data-anim="line"    → hairline draws from left (scaleX)
 *   data-anim="item"    → staggered rise (cards, bullets, metrics, nodes)
 *   data-anim="fade"    → soft fade (lead, footer, meta)
 * Blocks with their own data motion (counters, bars, SVG paths) listen for `t0` via the
 * `--enter-delay` convention: they start ~0.45s after mount.
 */
export function useSlideEnter(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const el = scope.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      if (reducedMotion()) {
        gsap.set(q('[data-anim]'), { opacity: 1 });
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: EASE.out } });
      tl.from(q('[data-anim="kicker"]'), { opacity: 0, x: -28, duration: 0.7 }, 0);
      tl.from(q('[data-anim="line"]'), { scaleX: 0, transformOrigin: '0 50%', duration: 1.1, ease: EASE.expo }, 0.05);

      // phrase mode (section openers): words rise in groups split at punctuation
      const phrase = !!el.querySelector('.section-num');
      q('[data-anim="title"]').forEach((t: Element) => {
        gsap.set(t, { opacity: 1 });
        if (phrase) {
          SplitText.create(t, {
            type: 'words',
            mask: 'words',
            wordsClass: 'split-word',
            autoSplit: true,
            onSplit: (self) => {
              let g = 0;
              const groups: Element[][] = [];
              self.words.forEach((w) => {
                (groups[g] ??= []).push(w);
                if (/[,;:?.!–—]$/.test(w.textContent ?? '')) g++;
              });
              return gsap.timeline({ delay: 0.1 }).add(groups.map((ws, i) => gsap.from(ws, { yPercent: 118, duration: 0.9, ease: EASE.expo, delay: i * 0.28 })), 0);
            },
          });
          return;
        }
        SplitText.create(t, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'split-line',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, { yPercent: 115, duration: 1.05, stagger: 0.09, ease: EASE.expo, delay: 0.08 }),
        });
      });

      tl.from(q('[data-anim="fade"]'), { opacity: 0, y: 12, duration: 0.9, stagger: 0.06 }, 0.3);
      tl.from(q('[data-anim="item"]'), { opacity: 0, y: 34, duration: 0.85, stagger: STAGGER }, 0.38);
    },
    { scope },
  );
}

/** Exit: quick directional fade of every animated element. Returns the timeline. */
export function exitSlide(el: HTMLElement, dir: 1 | -1, onComplete: () => void) {
  if (reducedMotion()) {
    onComplete();
    return null;
  }
  const targets = el.querySelectorAll('[data-anim]');
  return gsap.to(targets, {
    opacity: 0,
    y: -26 * dir,
    duration: 0.32,
    stagger: 0.012,
    ease: EASE.in,
    overwrite: true,
    onComplete,
  });
}
