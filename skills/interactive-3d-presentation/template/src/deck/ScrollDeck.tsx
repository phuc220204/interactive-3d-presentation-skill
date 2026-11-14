import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { deck, slides } from '../content';
import { useDeck } from './store';
import { BeatOverride } from './beatContext';
import { measureStage, STAGE_H, STAGE_W } from './Stage16x9';
import { SlideView } from './SlideView';
import { Scrims } from './Deck';
import { ThreeUIDirector } from '../threeui/ThreeUIDirector';
import { SourceDrawer } from '../hud/SourceDrawer';
import { NotesDrawer } from '../hud/NotesDrawer';
import { reducedMotion } from '../lib/pointer';
import { plain } from '../lib/rich';

const Scene3D = lazy(() => import('../three/Stage'));
const pad = (n: number) => String(n).padStart(2, '0');

/** One full-viewport section; the slide mounts the first time it scrolls into view (so its motion plays then). */
function Section({ i, scale, onSeen }: { i: number; scale: number; onSeen: (i: number) => void }) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(i === 0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio > 0.25) setSeen(true);
        if (e.intersectionRatio > 0.55) onSeen(i);
      },
      { threshold: [0, 0.25, 0.55, 0.8] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [i, onSeen]);
  const w = STAGE_W * scale;
  const h = STAGE_H * scale;
  return (
    <section ref={ref} data-section={i} className="relative h-screen w-full overflow-hidden">
      <div className="absolute" style={{ width: STAGE_W, height: STAGE_H, left: `calc(50% - ${w / 2}px)`, top: `calc(50% - ${h / 2}px)`, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
        {seen && <SlideView slide={slides[i]} index={i} />}
      </div>
    </section>
  );
}

/**
 * Landing-page / scrollytelling mode (deck.mode = 'scroll' or ?mode=scroll): same slides, blocks and 3D
 * stage, Lenis smooth scrolling; the 3D scene follows the section in view. All beats are revealed.
 */
export function ScrollDeck() {
  const [scale, setScale] = useState(() => measureStage());
  const index = useDeck((s) => s.index);
  const go = useDeck((s) => s.go);
  const lenis = useRef<Lenis | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // the deck locks the page (no scroll); scroll mode re-enables normal document scrolling
    for (const el of [document.documentElement, document.body, document.getElementById('root')!]) {
      el.style.overflow = 'visible';
      el.style.height = 'auto';
    }
    const on = () => setScale(measureStage());
    window.addEventListener('resize', on);
    const l = new Lenis({ smoothWheel: !reducedMotion(), lerp: 0.09 });
    lenis.current = l;
    l.on('scroll', (e: { progress: number }) => setProgress(e.progress));
    let raf = 0;
    const loop = (t: number) => {
      l.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const key = (e: KeyboardEvent) => {
      const cur = useDeck.getState().index;
      const to = (n: number) => document.querySelector<HTMLElement>(`[data-section="${n}"]`);
      if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        const t = to(Math.min(slides.length - 1, cur + 1));
        if (t) l.scrollTo(t, { duration: 1.2 });
      } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        const t = to(Math.max(0, cur - 1));
        if (t) l.scrollTo(t, { duration: 1.2 });
      } else if (e.key === 's' || e.key === 'S') useDeck.getState().toggle('notes');
      else if (e.key === 'Escape') useDeck.getState().closeAll();
    };
    window.addEventListener('keydown', key);
    return () => {
      cancelAnimationFrame(raf);
      l.destroy();
      window.removeEventListener('resize', on);
      window.removeEventListener('keydown', key);
      for (const el of [document.documentElement, document.body, document.getElementById('root')!]) {
        el.style.overflow = '';
        el.style.height = '';
      }
    };
  }, []);

  const onSeen = useRef((i: number) => go(i, 0)).current;
  return (
    <BeatOverride.Provider value={999}>
      <div className="fixed inset-0 bg-bg" aria-hidden />
      <Suspense fallback={null}>
        <Scene3D />
      </Suspense>
      <ThreeUIDirector />
      <Scrims />
      <div id="scene-labels" className="scene-labels" aria-hidden />
      <main className="relative z-10">
        {slides.map((s, i) => (
          <Section key={s.id} i={i} scale={scale} onSeen={onSeen} />
        ))}
      </main>
      {/* minimal fixed HUD */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-between px-8 py-5 font-mono text-[12px] tracking-[0.16em] text-muted uppercase">
        <span className="text-ink/80">{deck.brand}</span>
        <span>
          {pad(index + 1)} — {slides[index].section}
        </span>
      </div>
      <nav className="fixed right-6 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-3">
        {slides.map((s, i) => (
          <button
            key={s.id}
            title={plain(s.title)}
            onClick={() => {
              const t = document.querySelector<HTMLElement>(`[data-section="${i}"]`);
              if (t) lenis.current?.scrollTo(t, { duration: 1.2 });
            }}
            className={`h-2 w-2 rounded-full transition-all ${i === index ? 'scale-150 bg-accent' : 'bg-ink/30'}`}
          />
        ))}
      </nav>
      <div className="fixed inset-x-0 bottom-0 z-30 h-[3px] bg-ink/10">
        <div className="h-full bg-accent" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="grain" aria-hidden />
      <NotesDrawer />
      <SourceDrawer />
    </BeatOverride.Provider>
  );
}
