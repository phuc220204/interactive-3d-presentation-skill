import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { theme } from '../../content';
import type { PlotScene } from '../../types';
import { toneHex } from '../../lib/tone';
import { pointer } from '../../lib/pointer';
import { flowTubeMaterial } from '../materials';
import { Label } from '../fade';
import { gsap } from '../../motion/gsap';

export { compileFn } from '../../lib/expr';
import { compileFn } from '../../lib/expr';

const SEG = 64;

/** z = f(x, y) surface / data-matrix surface, or y = f(x) curve, with axes. Grows in on enter. */
export function Plot({ spec }: { spec: PlotScene; active: boolean }) {
  const st = spec.state;
  const mode = st.mode ?? (st.matrix ? 'surface' : st.fn && /y/i.test(st.fn) ? 'surface' : 'curve');
  const [a, b] = st.range ?? [-3, 3];
  const color = toneHex(st.tone, 'accent');
  const grow = useRef({ v: 0 }).current;
  const root = useRef<THREE.Group>(null);
  const surf = useRef<THREE.Mesh>(null);

  const f = useMemo(() => {
    try {
      return st.fn ? compileFn(st.fn) : null;
    } catch (e) {
      console.warn('[deck]', (e as Error).message);
      return null;
    }
  }, [st.fn]);

  const surface = useMemo(() => {
    if (mode !== 'surface') return null;
    const rows = st.matrix?.length ?? SEG + 1;
    const cols = st.matrix?.[0]?.length ?? SEG + 1;
    const g = new THREE.PlaneGeometry(3.2, 3.2, cols - 1, rows - 1);
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    const zs: number[] = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const x = a + ((b - a) * c) / (cols - 1);
        const y = a + ((b - a) * r) / (rows - 1);
        const z = st.matrix ? st.matrix[r][c] : f ? f(x, y) : 0;
        zs.push(Number.isFinite(z) ? z : 0);
      }
    const lo = Math.min(...zs);
    const hi = Math.max(...zs);
    const span = hi - lo || 1;
    const cA = new THREE.Color(theme.colors.cool);
    const cB = new THREE.Color(color);
    const cols3 = new Float32Array(zs.length * 3);
    zs.forEach((z, i) => {
      const t = (z - lo) / span;
      pos.setZ(i, (t - 0.5) * 1.8);
      const c = cA.clone().lerp(cB, t);
      cols3.set([c.r, c.g, c.b], i * 3);
    });
    g.setAttribute('color', new THREE.BufferAttribute(cols3, 3));
    g.computeVertexNormals();
    return g;
  }, [mode, st.matrix, f, a, b, color]);

  const curve = useMemo(() => {
    if (mode !== 'curve' || !f) return null;
    const pts: THREE.Vector3[] = [];
    const ys: number[] = [];
    let zeroY = 0;
    for (let i = 0; i <= 200; i++) {
      const x = a + ((b - a) * i) / 200;
      const y = f(x, 0);
      ys.push(Number.isFinite(y) ? y : 0);
    }
    const lo = Math.min(...ys);
    const hi = Math.max(...ys);
    const span = hi - lo || 1;
    ys.forEach((y, i) => pts.push(new THREE.Vector3(-2 + (4 * i) / 200, ((y - lo) / span - 0.5) * 2.6, 0)));
    zeroY = Math.min(1.4, Math.max(-1.4, ((0 - lo) / span - 0.5) * 2.6));
    const zeroX = Math.min(2, Math.max(-2, -2 + (4 * (0 - a)) / (b - a)));
    return { geo: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 400, 0.025, 8, false), zeroX, zeroY };
  }, [mode, f, a, b]);
  const tubeMat = useMemo(() => flowTubeMaterial(color, 0.9), [color]);

  useEffect(() => {
    grow.v = 0;
    tubeMat.uniforms.uReveal.value = 0;
    const t1 = gsap.to(grow, { v: 1, duration: 1.6, delay: 0.35, ease: 'expo.out' });
    const t2 = gsap.to(tubeMat.uniforms.uReveal, { value: 1, duration: 1.8, delay: 0.35, ease: 'power2.inOut' });
    return () => {
      t1.kill();
      t2.kill();
    };
  }, [surface, curve, grow, tubeMat]);

  useFrame((s, dt) => {
    tubeMat.uniforms.uTime.value = s.clock.elapsedTime;
    if (surf.current) surf.current.scale.z = grow.v;
    if (root.current && mode === 'surface') {
      root.current.rotation.z = THREE.MathUtils.damp(root.current.rotation.z, -0.6 + pointer.x * 0.25 + s.clock.elapsedTime * 0.03, 1.5, dt);
    }
  });

  const axis = (from: [number, number, number], to: [number, number, number]) => (
    <primitive
      object={new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...from), new THREE.Vector3(...to)]),
        new THREE.LineBasicMaterial({ color: theme.colors.muted, transparent: true, opacity: 0.7 }),
      )}
    />
  );

  if (mode === 'surface' && surface) {
    return (
      <group rotation={[-1.05, 0, 0]}>
        <group ref={root}>
          <mesh ref={surf} geometry={surface}>
            <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.6} metalness={0.1} transparent opacity={0.92} />
          </mesh>
          <mesh geometry={surface} scale={[1, 1, 1]}>
            <meshBasicMaterial color={theme.colors.ink} wireframe transparent opacity={0.12} />
          </mesh>
          {axis([-2.2, -2.2, -0.9], [2.4, -2.2, -0.9])}
          {axis([-2.2, -2.2, -0.9], [-2.2, 2.4, -0.9])}
          {axis([-2.2, -2.2, -0.9], [-2.2, -2.2, 1.4])}
          <Label position={[2.6, -2.2, -0.9]} text="x" />
          <Label position={[-2.2, 2.6, -0.9]} text="y" />
          <Label position={[-2.2, -2.2, 1.6]} text="z" />
        </group>
        {st.label && <Label position={[0, 0, 2.1]} text={st.label} color={color} />}
      </group>
    );
  }
  return (
    <group rotation={[0.08, -0.25, 0]}>
      {curve && <mesh geometry={curve.geo} material={tubeMat} />}
      {/* axes through the real origin (clamped to the plot box) */}
      {axis([-2.2, curve?.zeroY ?? 0, 0], [2.3, curve?.zeroY ?? 0, 0])}
      {axis([curve?.zeroX ?? 0, -1.6, 0], [curve?.zeroX ?? 0, 1.7, 0])}
      <Label position={[2.45, curve?.zeroY ?? 0, 0]} text="x" />
      <Label position={[curve?.zeroX ?? 0, 1.9, 0]} text="y" />
      {st.label && <Label position={[0, -1.95, 0]} text={st.label} color={color} />}
    </group>
  );
}
