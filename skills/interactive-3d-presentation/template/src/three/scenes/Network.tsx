import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { theme } from '../../content';
import type { NetworkScene } from '../../types';
import { toneHex } from '../../lib/tone';
import { flowTubeMaterial } from '../materials';
import { Label } from '../fade';
import { gsap } from '../../motion/gsap';

type N = NetworkScene['state']['nodes'][number];

/** Deterministic layout: centre nodes at the core, others on a tilted ring with gentle depth variation. */
function layout(nodes: N[]) {
  const centers = nodes.filter((n) => n.center);
  const outer = nodes.filter((n) => !n.center);
  const pos = new Map<string, THREE.Vector3>();
  centers.forEach((n, i) => pos.set(n.id, new THREE.Vector3((i - (centers.length - 1) / 2) * 0.9, 0, 0)));
  outer.forEach((n, i) => {
    const a = (i / outer.length) * Math.PI * 2 + Math.PI / 2;
    pos.set(n.id, new THREE.Vector3(Math.cos(a) * 1.85, Math.sin(a) * 1.45, Math.sin(a * 2 + 0.6) * 0.55));
  });
  return pos;
}

function Link({ a, b, color, delay }: { a: THREE.Vector3; b: THREE.Vector3; color: string; delay: number }) {
  const mat = useMemo(() => flowTubeMaterial(color, 0.3), [color]);
  const geo = useMemo(() => {
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.z += 0.35;
    return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 48, 0.011, 6, false);
  }, [a, b]);
  useEffect(() => {
    mat.uniforms.uReveal.value = 0;
    const tw = gsap.to(mat.uniforms.uReveal, { value: 1, duration: 1.1, delay: 0.6 + delay, ease: 'power2.inOut' });
    return () => {
      tw.kill();
    };
  }, [mat, geo, delay]);
  useFrame((s) => (mat.uniforms.uTime.value = s.clock.elapsedTime));
  return <mesh geometry={geo} material={mat} />;
}

function Node({ node, p, i }: { node: N; p: THREE.Vector3; i: number }) {
  const g = useRef<THREE.Group>(null);
  const color = toneHex(node.tone, node.center ? 'accent' : 'ink');
  const r = 0.1 * (node.size ?? (node.center ? 1.8 : 1));
  useEffect(() => {
    if (!g.current) return;
    g.current.scale.setScalar(0.001);
    const tw = gsap.to(g.current.scale, { x: 1, y: 1, z: 1, duration: 1, delay: 0.3 + i * 0.07, ease: 'back.out(2)' });
    return () => {
      tw.kill();
    };
  }, [i]);
  useFrame((s) => {
    if (g.current) g.current.position.set(p.x, p.y + Math.sin(s.clock.elapsedTime * 0.9 + i) * 0.04, p.z);
  });
  return (
    <group ref={g} position={p}>
      <mesh>
        <sphereGeometry args={[r, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={node.center ? 0.9 : 0.35} roughness={0.35} metalness={0.3} transparent />
      </mesh>
      <mesh>
        <sphereGeometry args={[r * 1.9, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} depthWrite={false} />
      </mesh>
      {node.label && (
        <Label position={[0, -r - 0.22, 0]} text={node.label} color={node.center ? color : undefined} />
      )}
    </group>
  );
}

/** Stakeholder / relationship graph. Link tone shows unity (accent) vs conflict (alert). */
export function Network({ spec }: { spec: NetworkScene; active: boolean }) {
  const { nodes, links } = spec.state;
  const key = nodes.map((n) => n.id).join('|');
  const pos = useMemo(() => layout(nodes), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const root = useRef<THREE.Group>(null);
  useFrame((s, dt) => {
    if (root.current) root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, Math.sin(s.clock.elapsedTime * 0.2) * 0.25, 1.5, dt);
  });
  return (
    <group ref={root} key={key}>
      {links.map((l, i) => {
        const a = pos.get(l.a);
        const b = pos.get(l.b);
        if (!a || !b) return null;
        return <Link key={`${l.a}-${l.b}-${l.tone}`} a={a} b={b} color={toneHex(l.tone, 'muted')} delay={i * 0.06} />;
      })}
      {nodes.map((n, i) => (
        <Node key={n.id} node={n} p={pos.get(n.id)!} i={i} />
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.3, 0.002, 6, 200]} />
        <meshBasicMaterial color={theme.colors.ink} transparent opacity={0.12} />
      </mesh>
    </group>
  );
}
