import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { slides, theme } from '../content';
import type { Layout } from '../types';
import { useDeck } from './store';
import { useDeckNav } from './useDeckNav';
import { Stage16x9 } from './Stage16x9';
import { SlideView } from './SlideView';
import { exitSlide } from '../motion/useSlideEnter';
import { gsap } from '../motion/gsap';
import { reducedMotion } from '../lib/pointer';
import { Hud } from '../hud/Hud';
import { Overview } from '../hud/Overview';
import { NotesDrawer } from '../hud/NotesDrawer';
import { HelpOverlay } from '../hud/HelpOverlay';
import { SourceDrawer } from '../hud/SourceDrawer';
import { installDevApi } from './devApi';
import { ThreeUIDirector } from '../threeui/ThreeUIDirector';

const Scene3D = lazy(() => import('../three/Stage'));

/** Readability scrims per layout — sit between the 3D canvas and the text, cross-fade on layout change. */
const SCRIMS: Record<Layout, string> = {
  cover: 'linear-gradient(90deg, var(--c-bg) 0%, color-mix(in srgb, var(--c-bg) 82%, transparent) 34%, transparent 64%)',
  split: 'linear-gradient(90deg, var(--c-bg) 0%, color-mix(in srgb, var(--c-bg) 86%, transparent) 38%, transparent 66%)',
  'split-right': 'linear-gradient(270deg, var(--c-bg) 0%, color-mix(in srgb, var(--c-bg) 86%, transparent) 38%, transparent 66%)',
  center: 'radial-gradient(ellipse 60% 55% at 50% 50%, color-mix(in srgb, var(--c-bg) 78%, transparent) 0%, color-mix(in srgb, var(--c-bg) 35%, transparent) 70%, transparent 100%)',
  grid: 'linear-gradient(180deg, color-mix(in srgb, var(--c-bg) 70%, transparent) 0%, color-mix(in srgb, var(--c-bg) 82%, transparent) 100%)',
  full: 'linear-gradient(0deg, var(--c-bg) 0%, color-mix(in srgb, var(--c-bg) 55%, transparent) 30%, transparent 55%)',
  references: 'linear-gradient(90deg, var(--c-bg) 0%, color-mix(in srgb, var(--c-bg) 92%, transparent) 70%, color-mix(in srgb, var(--c-bg) 60%, transparent) 100%)',
  section: 'linear-gradient(90deg, var(--c-bg) 0%, color-mix(in srgb, var(--c-bg) 80%, transparent) 50%, color-mix(in srgb, var(--c-bg) 40%, transparent) 100%)',
};

export function Scrims() {
  const layout = useDeck((s) => slides[s.index].layout ?? 'split');
  return (
    <div className="pointer-events-none fixed inset-0 z-[5]">
      {(Object.keys(SCRIMS) as Layout[]).map((l) => (
        <div
          key={l}
          className="absolute inset-0 transition-opacity duration-[900ms] ease-out"
          style={{ background: SCRIMS[l], opacity: l === layout ? 1 : 0 }}
        />
      ))}
      {/* global vignette */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, color-mix(in srgb, var(--c-bg) 85%, transparent) 100%)' }}
      />
    </div>
  );
}

/**
 * Mounts one slide at a time: exit current → mount next (enter animation runs inside SlideView).
 * theme.transition 'wipe': the new slide is revealed by a clip-path sweep led by a glowing scan line;
 * pressing next during a wipe finishes it instantly.
 */
function SlideHost() {
  const index = useDeck((s) => s.index);
  const dir = useDeck((s) => s.dir);
  const [shown, setShown] = useState(index);
  const host = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const exiting = useRef<ReturnType<typeof exitSlide>>(null);
  const wipe = useRef<gsap.core.Timeline | null>(null);
  const firstShow = useRef(true);

  useLayoutEffect(() => {
    if (index === shown) return;
    wipe.current?.progress(1);
    exiting.current?.kill();
    const el = host.current;
    if (!el) return setShown(index);
    exiting.current = exitSlide(el, dir, () => setShown(index));
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (firstShow.current) {
      firstShow.current = false;
      return;
    }
    if (theme.transition !== 'wipe' || reducedMotion() || !host.current || !line.current) return;
    const from = dir >= 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';
    wipe.current = gsap
      .timeline({ onComplete: () => gsap.set(host.current, { clearProps: 'clipPath' }) })
      .fromTo(host.current, { clipPath: from }, { clipPath: 'inset(0 0% 0 0%)', duration: 0.85, ease: 'power3.inOut' }, 0)
      .fromTo(line.current, { left: dir >= 0 ? 0 : 1918, opacity: 1 }, { left: dir >= 0 ? 1918 : 0, duration: 0.85, ease: 'power3.inOut' }, 0)
      .to(line.current, { opacity: 0, duration: 0.25 }, '>-0.05');
  }, [shown]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div ref={host} className="absolute inset-0">
        <SlideView key={shown} slide={slides[shown]} index={shown} />
      </div>
      {theme.transition === 'wipe' && <div ref={line} className="wipe-line" style={{ opacity: 0 }} aria-hidden="true" />}
    </>
  );
}

export function Deck() {
  useDeckNav();
  useEffect(() => installDevApi(), []);
  const cite = useDeck((s) => s.cite);
  useEffect(() => {
    document.documentElement.toggleAttribute('data-cite', cite);
  }, [cite]);
  return (
    <div className="fixed inset-0 overflow-hidden bg-bg">
      <Suspense fallback={null}>
        <Scene3D />
      </Suspense>
      <ThreeUIDirector />
      <Scrims />
      <div id="scene-labels" className="scene-labels" aria-hidden />
      <Stage16x9>
        <SlideHost />
        <Hud />
      </Stage16x9>
      <div className="grain" aria-hidden />
      <Overview />
      <NotesDrawer />
      <HelpOverlay />
      <SourceDrawer />
    </div>
  );
}
