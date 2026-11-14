import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ParallaxScene } from '../../types';
import { pointer } from '../../lib/pointer';
import { useTextureSafe } from '../texture';
import { gsap } from '../../motion/gsap';

const BASE_W = 4.6;

/** Soft-edged alpha mask so photo backgrounds melt into the slide instead of showing a hard rectangle. */
let feather: THREE.CanvasTexture | null = null;
function featherMask() {
  if (feather) return feather;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(128, 128, 60, 128, 128, 128);
  grd.addColorStop(0, '#fff');
  grd.addColorStop(1, '#000');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  feather = new THREE.CanvasTexture(c);
  return feather;
}

function Layer({ src, depth, scale = 1, x = 0, y = 0, i, soft }: { src: string; depth: number; scale?: number; x?: number; y?: number; i: number; soft: boolean }) {
  const { tex, aspect } = useTextureSafe(src);
  const g = useRef<THREE.Group>(null);
  const z = (depth - 0.5) * 2.4; // -1.2 (far) … +1.2 (near)
  // far layers are drawn larger so perspective doesn't shrink them out of the frame
  const w = BASE_W * scale * (1 + (0.5 - depth) * 0.5);
  useEffect(() => {
    if (!g.current) return;
    gsap.fromTo(g.current.position, { z: z - 1.5, y: y - 0.25 * (1 + depth) }, { z, y, duration: 1.6, delay: 0.15 + i * 0.12, ease: 'expo.out' });
  }, [z, y, depth, i]);
  useFrame((s, dt) => {
    const o = g.current;
    if (!o) return;
    // nearer layers move more → depth
    const k = 0.15 + depth * 0.55;
    o.position.x = THREE.MathUtils.damp(o.position.x, x + pointer.x * k + Math.sin(s.clock.elapsedTime * 0.25 + i) * 0.03 * k, 2.5, dt);
    o.rotation.y = THREE.MathUtils.damp(o.rotation.y, pointer.x * 0.05 * depth, 2.5, dt);
  });
  if (!tex) return null;
  return (
    <group ref={g} position={[x, y, z]}>
      <mesh renderOrder={i}>
        <planeGeometry args={[w, w / aspect]} />
        <meshBasicMaterial map={tex} alphaMap={soft ? featherMask() : null} transparent depthWrite={false} toneMapped={false} alphaTest={0.01} />
      </mesh>
    </group>
  );
}

/** 2.5D parallax diorama from layered 2D assets (photo backgrounds + transparent PNG cut-outs). */
export function Parallax({ spec }: { spec: ParallaxScene; active: boolean }) {
  const layers = [...spec.state.layers].sort((a, b) => a.depth - b.depth);
  return (
    <group>
      {layers.map((l, i) => (
        <Layer key={`${l.src}-${i}`} {...l} i={i} soft={i === 0 && !/\.(png|svg|webp)(\?|$)/i.test(l.src)} />
      ))}
    </group>
  );
}
