import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { theme } from '../../content';
import type { AmbientScene } from '../../types';
import { toneHex } from '../../lib/tone';
import { dotsMaterial, randAttr } from '../materials';

/** Quiet default: drifting star-dust + slow orbital hairlines. For text-heavy or transitional slides. */
export function Ambient({ spec }: { spec: AmbientScene; active: boolean }) {
  const density = spec.state?.density ?? 1;
  const count = Math.round(2200 * density);
  const { size, viewport } = useThree();
  const root = useRef<THREE.Group>(null);

  const geo = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.2 + Math.pow(Math.random(), 0.6) * 6;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      a[i * 3] = r * Math.sin(ph) * Math.cos(th);
      a[i * 3 + 1] = r * Math.cos(ph) * 0.6;
      a[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th) - 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(a, 3));
    g.setAttribute('aRand', randAttr(count));
    return g;
  }, [count]);
  const mat = useMemo(() => dotsMaterial(theme.colors.ink, 2.2, 0, 0.55), []);
  const accent = toneHex(spec.state?.tone, 'accent');

  useFrame((s, dt) => {
    mat.uniforms.uVH.value = size.height * viewport.dpr;
    if (root.current) {
      root.current.rotation.y += dt * 0.012;
      root.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.05) * 0.05;
    }
  });

  return (
    <group ref={root}>
      <points geometry={geo} material={mat} frustumCulled={false} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.35, i * 0.6, 0]}>
          <torusGeometry args={[1.6 + i * 0.55, 0.0025, 6, 256]} />
          <meshBasicMaterial color={i === 1 ? accent : theme.colors.ink} transparent opacity={i === 1 ? 0.45 : 0.14} toneMapped={false} />
        </mesh>
      ))}
      <mesh>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshBasicMaterial color={accent} wireframe transparent opacity={0.16} />
      </mesh>
    </group>
  );
}
