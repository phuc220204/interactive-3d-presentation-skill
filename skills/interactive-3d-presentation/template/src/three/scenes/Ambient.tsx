import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { theme } from '../../content';
import type { AmbientScene } from '../../types';
import { dotsMaterial, randAttr } from '../materials';

/**
 * Quiet default for slides whose message is the text: a thin veil of drifting dust spread over the whole frame —
 * no central object, nothing for the eye to lock onto. `state.density: 0` draws nothing (theme surface only).
 * It switches itself off entirely when the slide already has a visual, a table or figures (three/Stage.tsx).
 */
export function Ambient({ spec }: { spec: AmbientScene; active: boolean }) {
  const density = spec.state?.density ?? 1;
  const count = Math.round(600 * density);
  const { size, viewport } = useThree();
  const root = useRef<THREE.Group>(null);

  const geo = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // a wide flat slab in front of the camera: fills the frame evenly, no sphere silhouette
      a[i * 3] = (Math.random() - 0.5) * 16;
      a[i * 3 + 1] = (Math.random() - 0.5) * 9;
      a[i * 3 + 2] = -1 - Math.random() * 5;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(a, 3));
    g.setAttribute('aRand', randAttr(count));
    return g;
  }, [count]);
  const mat = useMemo(() => dotsMaterial(theme.colors.ink, 1.6, 0, 0.28), []);

  useFrame((s) => {
    mat.uniforms.uVH.value = size.height * viewport.dpr;
    if (root.current) {
      // slow sideways drift, no rotation around a centre
      root.current.position.x = Math.sin(s.clock.elapsedTime * 0.03) * 0.4;
      root.current.position.y = Math.cos(s.clock.elapsedTime * 0.025) * 0.2;
    }
  });

  if (!count) return null;
  return (
    <group ref={root}>
      <points geometry={geo} material={mat} frustumCulled={false} />
    </group>
  );
}
