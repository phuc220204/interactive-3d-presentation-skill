import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { theme } from '../../content';
import type { GearScene } from '../../types';
import { toneHex } from '../../lib/tone';
import { Label } from '../fade';
import { gsap } from '../../motion/gsap';
import { reducedMotion } from '../../lib/pointer';

/** Gear outline: n teeth, outer radius R, root radius r, with a bore. */
function gearShape(n: number, R: number, r: number, bore: number) {
  const s = new THREE.Shape();
  const step = (Math.PI * 2) / n;
  for (let i = 0; i < n; i++) {
    const a = i * step;
    const pts: [number, number][] = [
      [r, a],
      [R, a + step * 0.18],
      [R, a + step * 0.5],
      [r, a + step * 0.68],
    ];
    pts.forEach(([rad, ang], k) => {
      const x = Math.cos(ang) * rad;
      const y = Math.sin(ang) * rad;
      if (i === 0 && k === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    });
  }
  s.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, bore, 0, Math.PI * 2, true);
  s.holes.push(hole);
  return s;
}

function GearMesh({ n, R, depth, color, spin }: { n: number; R: number; depth: number; color: string; spin: number }) {
  const ref = useRef<THREE.Group>(null);
  const { geo, edges } = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(gearShape(n, R, R * 0.84, R * 0.28), { depth, bevelEnabled: true, bevelThickness: depth * 0.12, bevelSize: R * 0.02, bevelSegments: 2, curveSegments: 24 });
    g.center();
    return { geo: g, edges: new THREE.EdgesGeometry(g, 25) };
  }, [n, R, depth]);
  const dark = theme.mode === 'dark';
  useFrame((_, dt) => {
    if (ref.current && !reducedMotion()) ref.current.rotation.z += dt * spin;
  });
  return (
    <group ref={ref}>
      <mesh geometry={geo}>
        <meshStandardMaterial color={color} metalness={0.35} roughness={0.45} transparent opacity={dark ? 0.85 : 0.92} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={dark ? theme.colors.ink : theme.colors.ink} transparent opacity={dark ? 0.55 : 0.7} />
      </lineSegments>
    </group>
  );
}

/**
 * Machine / process / industry: a solid extruded gear tilts in from edge-on and turns, two small gears
 * mesh with it in the opposite direction. Optional labels name what each gear stands for.
 */
export function Gear({ spec }: { spec: GearScene; active: boolean }) {
  const st = spec.state;
  const root = useRef<THREE.Group>(null);
  const main = toneHex(st.tone ?? 'accent');
  const teeth = st.teeth ?? 18;
  const spin = st.spin === false ? 0 : 0.25;

  useEffect(() => {
    const g = root.current;
    if (!g) return;
    if (reducedMotion()) {
      g.rotation.set(-0.55, 0.35, 0);
      return;
    }
    g.rotation.set(-Math.PI / 2 + 0.05, 0, 0);
    const tl = gsap.timeline();
    tl.to(g.rotation, { x: -0.55, y: 0.35, duration: 2.2, ease: 'power3.inOut', delay: 0.3 });
    tl.to(g.rotation, { y: 0.15, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    return () => {
      tl.kill();
    };
  }, []);

  const small = st.labels?.length ? st.labels.slice(1, 3) : [];
  return (
    <group scale={0.72}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <group ref={root}>
        <GearMesh n={teeth} R={1.35} depth={0.32} color={main} spin={spin} />
        <group position={[1.35 + 0.62, 0.55, 0.05]}>
          <GearMesh n={Math.round(teeth / 2)} R={0.7} depth={0.26} color={toneHex('cool')} spin={-spin * 1.9} />
        </group>
        <group position={[-1.35 - 0.52, -0.62, 0.05]}>
          <GearMesh n={Math.round(teeth / 2.5)} R={0.58} depth={0.24} color={toneHex('ink')} spin={-spin * 2.3} />
        </group>
        {/* labels ride with the tilted assembly: each sits just outside its gear */}
        {st.labels?.[0] && <Label position={[0, -1.85, 0.3]} text={st.labels[0]} />}
        {small[0] && <Label position={[1.97, 1.45, 0.3]} text={small[0]} small />}
        {small[1] && <Label position={[-1.87, -1.7, 0.3]} text={small[1]} small />}
      </group>
    </group>
  );
}
