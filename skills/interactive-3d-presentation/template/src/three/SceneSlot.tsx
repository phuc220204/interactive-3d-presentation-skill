import { useEffect, useRef, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from '../motion/gsap';
import { stage } from '../deck/Stage16x9';
import { applyFade, FadeCtx } from './fade';

export const CAM_Z = 10;
export const FOV = 35;

/** Stage-fraction anchor → world position on the z=0 plane (camera at rest). */
export function anchorToWorld(anchor: [number, number], aspect: number, out = new THREE.Vector3()) {
  const visH = 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const visW = visH * aspect;
  const sx = (stage.left + anchor[0] * stage.width) / stage.vw;
  const sy = (stage.top + anchor[1] * stage.height) / stage.vh;
  return out.set((sx - 0.5) * visW, -(sy - 0.5) * visH, 0);
}

/**
 * Wraps one scene: positions it at its layout anchor, scales with the stage,
 * and drives its presence (fade in / dim / fade out → unmount).
 */
export function SceneSlot({
  active,
  dim,
  anchor,
  scale,
  onGone,
  children,
}: {
  active: boolean;
  dim: number;
  anchor: [number, number];
  scale: number;
  onGone: () => void;
  children: ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const fade = useRef({ v: 0 }).current;
  const { size } = useThree();
  const target = useRef(new THREE.Vector3());
  const first = useRef(true);

  useEffect(() => {
    const tw = gsap.to(fade, {
      v: active ? dim : 0,
      duration: active ? 1.4 : 0.6,
      delay: active ? 0.15 : 0,
      ease: active ? 'power2.out' : 'power2.in',
      onComplete: () => {
        if (!active) onGone();
      },
    });
    return () => {
      tw.kill();
    };
  }, [active, dim]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    anchorToWorld(anchor, size.width / size.height, target.current);
    const s = (stage.height / stage.vh) * scale * (0.82 + 0.18 * Math.min(1, fade.v / Math.max(dim, 0.001)));
    if (first.current) {
      g.position.copy(target.current);
      g.scale.setScalar(s * 0.8);
      first.current = false;
    }
    g.position.x = THREE.MathUtils.damp(g.position.x, target.current.x, 3.2, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, target.current.y, 3.2, dt);
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, s, 3.2, dt));
    applyFade(g, fade.v);
  });

  return (
    <FadeCtx.Provider value={fade}>
      <group ref={group}>{children}</group>
    </FadeCtx.Provider>
  );
}
