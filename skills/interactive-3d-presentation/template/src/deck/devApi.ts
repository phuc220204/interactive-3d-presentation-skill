import { slides } from '../content';
import { useDeck } from './store';
import { beatCount } from './beats';

/**
 * QA hooks for AI agents / browser automation:
 *   window.__deck.go(n)        → jump to slide n (0-based)
 *   window.__deck.count        → number of slides
 *   window.__deck.overflow()   → list of [data-fit] regions on the current slide whose content is clipped
 *   window.__deck.audit()      → { id, overflow[] } for the current slide
 */
export function checkOverflow(): string[] {
  const out: string[] = [];
  document.querySelectorAll<HTMLElement>('[data-fit]').forEach((el) => {
    const over = el.scrollHeight - el.clientHeight > 2 || el.scrollWidth - el.clientWidth > 2;
    if (over) out.push(`${el.dataset.fit} (+${el.scrollHeight - el.clientHeight}px)`);
  });
  return out;
}

export function installDevApi() {
  const api = {
    /** per-slide extra QA wait (slide.qaWait, ms) */
    get qaWaits() {
      return slides.map((s) => s.qaWait ?? 0);
    },
    get count() {
      return slides.length;
    },
    get index() {
      return useDeck.getState().index;
    },
    get beat() {
      return useDeck.getState().beat;
    },
    go: (n: number, beat = 0) => useDeck.getState().go(n, beat),
    next: () => useDeck.getState().next(),
    prev: () => useDeck.getState().prev(),
    /** jump to the last beat of slide n (everything revealed) — used by QA screenshots */
    goEnd: (n: number) => useDeck.getState().go(n, beatCount(slides[n])),
    beats: (n: number) => beatCount(slides[n]),
    overflow: checkOverflow,
    audit: () => ({ id: slides[useDeck.getState().index].id, overflow: checkOverflow() }),
  };
  (window as unknown as { __deck: typeof api }).__deck = api;
}
