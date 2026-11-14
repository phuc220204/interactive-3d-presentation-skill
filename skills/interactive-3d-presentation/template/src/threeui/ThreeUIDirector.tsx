import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { slides } from '../content';
import { useDeck } from '../deck/store';
import { stage } from '../deck/Stage16x9';
import { gsap } from '../motion/gsap';
import type { Layout, SplineScene, ThreeUIScene } from '../types';

// keep ThreeUI (and its CSS) out of the main chunk entirely
const ThreeUIView = lazy(() => import('./ThreeUIView').then((m) => ({ default: m.ThreeUIView })));
const SplineView = lazy(() => import('./SplineView').then((m) => ({ default: m.SplineView })));

type DomScene = ThreeUIScene | SplineScene;

/** Visual region per layout, as fractions of the 16:9 stage: [cx, cy, w, h]. */
const REGION: Record<Layout, [number, number, number, number]> = {
  cover: [0.73, 0.5, 0.5, 0.86],
  split: [0.74, 0.52, 0.48, 0.8],
  'split-right': [0.26, 0.52, 0.48, 0.8],
  center: [0.5, 0.5, 1, 1],
  grid: [0.5, 0.5, 1, 1],
  full: [0.6, 0.45, 0.8, 0.9],
  references: [0.86, 0.5, 0.3, 0.8],
  section: [0.78, 0.5, 0.44, 0.8],
};

interface Item {
  key: string;
  spec: DomScene;
  layout: Layout;
  active: boolean;
}

function Layer({ item, onGone }: { item: Item; onGone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [, force] = useState(0);
  useEffect(() => {
    const on = () => force((n) => n + 1);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const tw = gsap.to(ref.current, {
      opacity: item.active ? 1 : 0,
      duration: item.active ? 1.2 : 0.6,
      delay: item.active ? 0.2 : 0,
      ease: 'power2.inOut',
      onComplete: () => !item.active && onGone(),
    });
    return () => {
      tw.kill();
    };
  }, [item.active]); // eslint-disable-line react-hooks/exhaustive-deps

  const placement = item.spec.placement ?? (item.spec.name === 'spline' ? 'visual' : 'background');
  let style: React.CSSProperties = { opacity: 0 };
  if (placement === 'visual') {
    const [cx, cy, w, h] = item.spec.anchor ? [...item.spec.anchor, 0.48, 0.8] : REGION[item.layout];
    const s = item.spec.scale ?? 1;
    const W = stage.width * w * s;
    const H = stage.height * h * s;
    // soft radial mask: effects whose backdrop is not pure black/white never show a hard box edge
    const mask = 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 58%, transparent 100%)';
    style = {
      ...style,
      position: 'fixed',
      left: stage.left + cx * stage.width - W / 2,
      top: stage.top + cy * stage.height - H / 2,
      width: W,
      height: H,
      zIndex: 6,
      maskImage: mask,
      WebkitMaskImage: mask,
    };
  } else {
    style = { ...style, position: 'fixed', inset: 0, zIndex: 3 };
  }
  if (failed) return null;
  return (
    <div ref={ref} style={style} className="pointer-events-none" aria-hidden data-threeui={item.spec.name === 'threeui' ? item.spec.component : 'spline'}>
      <Suspense fallback={null}>
        {item.spec.name === 'threeui' ? (
          <ThreeUIView name={item.spec.component} props={item.spec.props} onError={() => setFailed(true)} />
        ) : (
          <SplineView scene={item.spec.scene} onError={() => setFailed(true)} />
        )}
      </Suspense>
    </div>
  );
}

/**
 * DOM layer for `scene: { name: 'threeui', … }` slides. Cross-fades between effects and keeps at most
 * the current + the outgoing instance alive (each ThreeUI effect owns a WebGL context).
 */
export function ThreeUIDirector() {
  const index = useDeck((s) => s.index);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const s = slides[index];
    const spec = s.scene.name === 'threeui' || s.scene.name === 'spline' ? (s.scene as DomScene) : null;
    const key = !spec ? null : spec.name === 'threeui' ? `${spec.component}:${spec.placement ?? 'background'}:${JSON.stringify(spec.props ?? {})}` : `spline:${spec.scene}:${spec.placement ?? 'visual'}`;
    setItems((list) => {
      // drop anything already fading out → never more than 2 live contexts
      const next = list.filter((x) => x.active).map((x) => ({ ...x, active: x.key === key }));
      const cur = next.find((x) => x.key === key);
      if (spec && key && !cur) next.push({ key, spec, layout: s.layout ?? 'split', active: true });
      else if (cur && spec) Object.assign(cur, { spec, layout: s.layout ?? 'split' });
      return next;
    });
  }, [index]);

  return (
    <>
      {items.map((it) => (
        <Layer key={it.key} item={it} onGone={() => setItems((l) => l.filter((x) => x.key !== it.key || x.active))} />
      ))}
    </>
  );
}
