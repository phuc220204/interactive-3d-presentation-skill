import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { theme } from '../../content';
import type { TowersScene } from '../../types';
import { toneHex } from '../../lib/tone';
import { fmt } from '../../lib/format';
import { Label } from '../fade';
import { gsap } from '../../motion/gsap';

const MAX_H = 2.5; //   world height of the tallest column
const SLAB = 0.075; //  slab thickness
const GAP = 0.022;
const W = 0.62;

/** One column of stacked slabs ("stacked coins") — height ∝ value. */
function Column({ x, value, max, color, label, display, unit, delay }: {
  x: number; value: number; max: number; color: string; label: string; display?: string; unit?: string; delay: number;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const n = Math.max(1, Math.round((value / max) * (MAX_H / (SLAB + GAP))));
  const grow = useRef({ v: 0 }).current;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const topY = n * (SLAB + GAP);
  const labelGroup = useRef<THREE.Group>(null);

  useEffect(() => {
    grow.v = 0;
    const tw = gsap.to(grow, { v: 1, duration: 1.8, delay: 0.35 + delay, ease: 'expo.out' });
    return () => {
      tw.kill();
    };
  }, [value, max, delay, grow]);

  useFrame((s) => {
    const m = mesh.current;
    if (!m) return;
    const shown = Math.max(1, Math.ceil(n * grow.v));
    m.count = shown;
    for (let i = 0; i < shown; i++) {
      const wob = Math.sin(s.clock.elapsedTime * 0.8 + i * 0.35 + x) * 0.006;
      dummy.position.set(x + wob, i * (SLAB + GAP) + SLAB / 2, wob);
      dummy.rotation.y = Math.sin(i * 0.9) * 0.025;
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    labelGroup.current?.position.set(x, shown * (SLAB + GAP) + 0.32, 0);
  });

  return (
    <group>
      <instancedMesh ref={mesh} args={[undefined, undefined, n]} frustumCulled={false}>
        <boxGeometry args={[W, SLAB, W]} />
        <meshStandardMaterial color={color} metalness={0.55} roughness={0.32} emissive={color} emissiveIntensity={0.18} transparent />
      </instancedMesh>
      {/* footprint glow */}
      <mesh position={[x, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 1.9, W * 1.9]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <group ref={labelGroup} position={[x, topY + 0.32, 0]}>
        <Label value={display ?? fmt(value)} color={color} text={`${label}${unit ? ` · ${unit}` : ''}`} />
      </group>
    </group>
  );
}

/** 3D stacked-slab bar comparison of quantities (GDP vs revenue, before vs after…). Labels track column tops. */
export function Towers({ spec }: { spec: TowersScene; active: boolean }) {
  const items = spec.state.items;
  const max = Math.max(...items.map((i) => i.value)) || 1;
  const spacing = 1.15;
  const x0 = -((items.length - 1) * spacing) / 2;
  const root = useRef<THREE.Group>(null);
  useFrame((s, dt) => {
    if (root.current) root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, -0.55 + Math.sin(s.clock.elapsedTime * 0.15) * 0.08, 2, dt);
  });
  return (
    <group position={[0, -1.45, 0]} rotation={[0.38, 0, 0]}>
      <group ref={root}>
        {items.map((it, i) => (
          <Column
            key={`${it.label}-${i}`}
            x={x0 + i * spacing}
            value={it.value}
            max={max}
            color={toneHex(it.tone, i === items.length - 1 ? 'accent' : 'alert')}
            label={it.label}
            display={it.display}
            unit={spec.state.unit}
            delay={i * 0.15}
          />
        ))}
        {/* floor grid */}
        <gridHelper args={[7, 14, theme.colors.line, theme.colors.line]} position={[0, 0, 0]} />
      </group>
    </group>
  );
}
