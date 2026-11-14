import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/** Presence of the enclosing scene (0 = gone, 1 = fully visible). Mutable, read in useFrame. */
export const FadeCtx = createContext<{ v: number }>({ v: 1 });
export const useFade = () => useContext(FadeCtx);

/**
 * Apply presence to every material under `root`:
 *   - ShaderMaterials with a `uFade` uniform get it set directly.
 *   - Others get opacity = userData.baseOpacity × fade (scenes change baseOpacity, not opacity).
 */
export function applyFade(root: THREE.Object3D, v: number) {
  root.visible = v > 0.003;
  root.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    if (!m) return;
    const list = Array.isArray(m) ? m : [m];
    for (const mat of list) {
      const sm = mat as THREE.ShaderMaterial;
      if (sm.uniforms && sm.uniforms.uFade) {
        sm.uniforms.uFade.value = v;
        continue;
      }
      if (mat.userData.baseOpacity === undefined) {
        mat.userData.baseOpacity = mat.opacity;
        mat.transparent = true;
      }
      mat.opacity = mat.userData.baseOpacity * v;
    }
  });
}

/** Common uniforms helper for shader materials that should react to fade + time + viewport. */
export function useShaderClock(material: React.RefObject<THREE.ShaderMaterial | null>) {
  const { size, viewport } = useThree();
  useFrame((state) => {
    const m = material.current;
    if (!m) return;
    if (m.uniforms.uTime) m.uniforms.uTime.value = state.clock.elapsedTime;
    if (m.uniforms.uVH) m.uniforms.uVH.value = size.height * viewport.dpr;
  });
}

/* ------------------------------------------------------------------ */
/* Labels: a single DOM layer above the canvas (below slide text).     */
/* Imperative DOM (no extra React roots) → no unmount races, cheap.     */
/* ------------------------------------------------------------------ */
let layer: HTMLDivElement | null = null;
function getLayer() {
  // Deck.tsx renders <div id="scene-labels"> between the scrims and the slide stage (same stacking context).
  const host = document.getElementById('scene-labels');
  if (host) return host;
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'scene-labels';
    document.body.appendChild(layer);
  }
  return layer;
}

export interface LabelProps {
  position?: [number, number, number];
  /** big figure on top (display font) */
  value?: string;
  /** main mono text */
  text?: string;
  /** small dimmed prefix, e.g. "01" */
  sub?: string;
  /** colour for value (or text when no value) */
  color?: string;
  dim?: boolean;
  small?: boolean;
  visible?: boolean;
  /** evaluated every frame (e.g. hide labels on the far side of a globe) */
  getVisible?: () => boolean;
  align?: 'center' | 'left' | 'right';
  /** shift this label up/down when it would cover another `avoid` label drawn earlier in the frame */
  avoid?: boolean;
}

/** Text pinned to a 3D point; fades with its scene. Styled by `.scene-label` (index.css). */
/** Boxes of 'avoid' labels already placed this frame (screen px). */
const placed: { t: number; boxes: { x: number; y: number; w: number; h: number }[] } = { t: -1, boxes: [] };

export function Label({ position = [0, 0, 0], value, text, sub, color, dim, small, visible = true, getVisible, align = 'center', avoid }: LabelProps) {
  const fade = useFade();
  const anchor = useRef<THREE.Group>(null);
  const el = useMemo(() => document.createElement('div'), []);
  const cur = useRef(0);
  const v = useMemo(() => new THREE.Vector3(), []);
  const { camera, size } = useThree();

  useEffect(() => {
    el.className = `scene-label${small ? ' scene-label--small' : ''}`;
    el.style.opacity = '0';
    getLayer().appendChild(el);
    return () => el.remove();
  }, [el, small]);

  useEffect(() => {
    el.replaceChildren();
    if (value) {
      const b = document.createElement('b');
      b.textContent = value;
      if (color) b.style.color = color;
      el.appendChild(b);
    }
    if (text || sub) {
      const s = document.createElement('span');
      if (sub) {
        const i = document.createElement('i');
        i.textContent = `${sub} `;
        s.appendChild(i);
      }
      s.appendChild(document.createTextNode(text ?? ''));
      if (color && !value) s.style.color = color;
      if (dim) s.style.opacity = '0.55';
      el.appendChild(s);
    }
  }, [el, value, text, sub, color, dim]);

  const tx = align === 'center' ? '-50%' : align === 'left' ? '0%' : '-100%';
  const shiftY = useRef(0);
  useFrame((state, dt) => {
    const a = anchor.current;
    if (!a) return;
    a.getWorldPosition(v);
    v.project(camera);
    const x = size.left + (v.x * 0.5 + 0.5) * size.width;
    let y = size.top + (-v.y * 0.5 + 0.5) * size.height;
    const show = visible && v.z < 1 && (!getVisible || getVisible());
    if (avoid && show) {
      if (placed.t !== state.clock.elapsedTime) {
        placed.t = state.clock.elapsedTime;
        placed.boxes = [];
      }
      const w = el.offsetWidth || 120;
      const h = (el.offsetHeight || 18) + 4;
      const left = align === 'center' ? x - w / 2 : align === 'left' ? x : x - w;
      let dy = 0;
      // try: stay, below, above, further below, further above
      for (const cand of [0, h, -h, 2 * h, -2 * h, 3 * h]) {
        const top = y + cand - h / 2;
        if (!placed.boxes.some((b) => left < b.x + b.w && left + w > b.x && top < b.y + b.h && top + h > b.y)) {
          dy = cand;
          break;
        }
      }
      shiftY.current = THREE.MathUtils.damp(shiftY.current, dy, 10, dt);
      y += shiftY.current;
      placed.boxes.push({ x: left, y: y - h / 2, w, h });
    }
    cur.current = THREE.MathUtils.damp(cur.current, (show ? 1 : 0) * fade.v, 6, dt);
    el.style.opacity = cur.current.toFixed(3);
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(${tx}, -50%)`;
  });

  return <group ref={anchor} position={position} />;
}
