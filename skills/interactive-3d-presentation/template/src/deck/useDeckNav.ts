import { useEffect } from 'react';
import { useDeck } from './store';
import { cycleTheme } from '../lib/applyTheme';
import { toggleLook } from '../themes';

/** Is the event inside a [data-scrollable] element that can still scroll that way? (notes drawer, references) */
function insideScrollable(target: EventTarget | null, dy: number) {
  let el = target as HTMLElement | null;
  while (el && el !== document.body) {
    if (el.dataset && el.dataset.scrollable !== undefined) {
      if (el.scrollHeight <= el.clientHeight + 1) return false;
      if (dy > 0) return el.scrollTop + el.clientHeight < el.scrollHeight - 1;
      return el.scrollTop > 0;
    }
    el = el.parentElement;
  }
  return false;
}

/** Elements that own their clicks (cards that expand, gallery images, citations, buttons, HUD…). */
const INTERACTIVE = 'button, a, input, select, textarea, video, iframe, [data-interactive], [data-c], [data-scrollable], .scene-labels';

/**
 * Presenter input. Everything advances BEATS first (nhịp), then slides:
 *   →  Space  PageDown  ↓  · presenter clicker · left click on the stage   → next
 *   ←  PageUp  ↑  · Shift+click · right click                               → previous
 *   wheel (one gesture = one step, 800 ms lock) · touch swipe
 *   Home/End · O overview · S/N notes · K citations · P presenter window · T start timer
 *   F fullscreen · ? help · Esc close · Shift+T (dev only) cycle theme presets
 */
export function useDeckNav() {
  useEffect(() => {
    const s = () => useDeck.getState();
    const anyOverlay = () => s().overview || s().help || !!s().source;

    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'ArrowDown') {
        e.preventDefault();
        if (!anyOverlay()) s().next();
      } else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'ArrowUp') {
        e.preventDefault();
        if (!anyOverlay()) s().prev();
      } else if (k === 'Home') s().go(0);
      else if (k === 'End') s().go(Number.MAX_SAFE_INTEGER);
      else if (k === 'o' || k === 'O' || k === 'm' || k === 'M') s().toggle('overview');
      else if (k === 's' || k === 'S' || k === 'n' || k === 'N') s().toggle('notes');
      else if (k === 'k' || k === 'K') s().toggle('cite');
      else if (k === '?' || k === 'h' || k === 'H') s().toggle('help');
      else if (k === 'f' || k === 'F') {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen?.();
      } else if (k === 'T' && e.shiftKey && import.meta.env.DEV) {
        cycleTheme(); // preview presets while designing; a finished deck keeps ONE theme
      } else if (k === 't' || k === 'T') {
        s().startClock();
      } else if (k === 'd' || k === 'D') {
        toggleLook(); // light ↔ dark variant of the deck's theme (projector in a bright / dark room); remembered
      } else if (k === 'p' || k === 'P') {
        window.open(`${location.pathname}?presenter${location.hash}`, 'deck-presenter', 'width=1200,height=760');
      } else if (k === 'Escape') s().closeAll();
    };

    // Click on the stage = next beat; Shift+click / right click = previous. Interactive elements keep their clicks.
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || anyOverlay() || e.ctrlKey) return;
      const t = e.target as HTMLElement;
      if (!t.closest('[data-stage]') || t.closest(INTERACTIVE)) return;
      if (window.getSelection()?.toString()) return;
      if (e.shiftKey) s().prev();
      else s().next();
    };
    const onContext = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('[data-stage]') || t.closest(INTERACTIVE) || anyOverlay()) return;
      e.preventDefault();
      s().prev();
    };

    // Wheel: accumulate, then lock 800ms so one gesture = one step
    let locked = false;
    let acc = 0;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault(); // Ctrl + wheel = zoom the 3D map, not the page / not the next slide
        return;
      }
      const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (insideScrollable(e.target, d)) return;
      if (anyOverlay()) return;
      e.preventDefault();
      if (locked) return;
      acc += d;
      if (Math.abs(acc) < 40) return;
      if (acc > 0) s().next();
      else s().prev();
      acc = 0;
      locked = true;
      window.setTimeout(() => (locked = false), 800);
    };

    // Touch swipe
    let x0 = 0;
    let y0 = 0;
    let t0 = 0;
    let startTarget: EventTarget | null = null;
    const onStart = (e: TouchEvent) => {
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
      t0 = Date.now();
      startTarget = e.target;
    };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      if (Date.now() - t0 > 800) return;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) s().next();
        else s().prev();
      } else if (Math.abs(dy) > 60 && !insideScrollable(startTarget, -dy)) {
        if (dy < 0) s().next();
        else s().prev();
      }
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('click', onClick);
    window.addEventListener('contextmenu', onContext);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('click', onClick);
      window.removeEventListener('contextmenu', onContext);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, []);
}
