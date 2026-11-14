import { Component, useEffect, useState, type ComponentType, type CSSProperties, type ReactNode } from 'react';
import '@designcodeio/threeui/style.css';
import { theme } from '../content';
import { THREEUI } from './catalog';

class Boundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(e: unknown) {
    console.warn('[deck] ThreeUI effect crashed — slide falls back to the theme surface.', e);
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Renders one ThreeUI effect, adapted to the active theme:
 *  dark theme  → mix-blend screen (its black backdrop vanishes into our surface)
 *  light theme → native light mode, or inverted (+hue 180°), then mix-blend multiply (reads as ink on paper)
 */
export function ThreeUIView({ name, props, onError }: { name: string; props?: Record<string, unknown>; onError?: () => void }) {
  const entry = THREEUI[name];
  const [Comp, setComp] = useState<ComponentType<Record<string, unknown>> | null>(null);

  useEffect(() => {
    let alive = true;
    if (!entry) {
      console.warn(`[deck] unknown ThreeUI effect "${name}" — add it to src/threeui/catalog.ts`);
      onError?.();
      return;
    }
    entry
      .load()
      .then((c) => alive && setComp(() => c))
      .catch((e) => {
        console.warn(`[deck] ThreeUI "${name}" failed to load`, e);
        onError?.();
      });
    return () => {
      alive = false;
    };
  }, [name]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!entry) return null;
  const light = theme.mode === 'light';
  const native = light && entry.light === 'native';
  const style: CSSProperties = {
    position: 'absolute',
    inset: 0,
    mixBlendMode: light ? 'multiply' : 'screen',
    filter: light && !native ? 'invert(1) hue-rotate(180deg)' : undefined,
  };
  return (
    <Boundary onError={() => onError?.()}>
      <div className="threeui-host" style={style}>
        {Comp && <Comp mode={light ? 'light' : 'dark'} {...entry.props} {...props} />}
      </div>
    </Boundary>
  );
}
