import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { theme } from '../../content';
import type { GalleryScene as GallerySpec } from '../../types';
import { pointer } from '../../lib/pointer';
import { useTextureSafe } from '../texture';
import { Label } from '../fade';
import { gsap } from '../../motion/gsap';

const H = 1.55; // picture height (world units)

function Frame({ src, label, framed, focus }: { src: string; label?: string; framed: boolean; focus: boolean }) {
  const { tex, aspect } = useTextureSafe(src);
  const w = Math.min(2.6, Math.max(0.9, H * aspect));
  const pad = framed ? 0.12 : 0.02;
  return (
    <group>
      {/* shadow */}
      <mesh position={[0.06, -0.07, -0.04]}>
        <planeGeometry args={[w + pad * 2, H + pad * 2]} />
        <meshBasicMaterial color="#000" transparent opacity={theme.mode === 'light' ? 0.12 : 0.4} depthWrite={false} />
      </mesh>
      {/* passe-partout / frame */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[w + pad * 2, H + pad * 2]} />
        <meshStandardMaterial color={framed ? theme.colors.paper : theme.colors.ink} roughness={0.8} transparent />
      </mesh>
      <mesh>
        <planeGeometry args={[w, H]} />
        {tex ? (
          <meshStandardMaterial map={tex} roughness={0.55} transparent toneMapped={false} />
        ) : (
          <meshBasicMaterial color={theme.colors.bg2} transparent />
        )}
      </mesh>
      {label && <Label position={[0, -H / 2 - pad - 0.18, 0]} text={label} dim={!focus} />}
    </group>
  );
}

/** Photos / artworks / covers as framed objects in space. `focus` turns one to the front. */
export function GalleryScene({ spec }: { spec: GallerySpec; active: boolean }) {
  const { items, focus = 0, arrangement = 'arc', frame = true } = spec.state;
  const n = items.length;
  const root = useRef<THREE.Group>(null);
  const spinTarget = useRef(0);

  const placements = useMemo(() => {
    return items.map((_, i) => {
      if (arrangement === 'wall') {
        const cols = Math.ceil(Math.sqrt(n * 1.6));
        const r = Math.floor(i / cols), c = i % cols;
        const rows = Math.ceil(n / cols);
        return { pos: new THREE.Vector3((c - (cols - 1) / 2) * 2.3, ((rows - 1) / 2 - r) * 2.05, 0), rotY: 0, scale: cols > 2 ? 0.8 : 1 };
      }
      if (arrangement === 'stack') {
        const k = i - focus;
        return { pos: new THREE.Vector3(k * 0.42, -Math.abs(k) * 0.05, -Math.abs(k) * 0.5), rotY: -k * 0.12, scale: 1 };
      }
      // keep the whole arc inside the layout's visual region (≈ ±2.6 units)
      // spacing follows frame width so frames never overlap; arc reads best with ≤ 4 items (use 'wall' for more)
      const R = 3.2;
      const scale = n > 3 ? 0.78 : 1;
      const step = Math.min(0.6, (1.25 * scale + 0.22) / R);
      const a = (i - (n - 1) / 2) * step;
      return { pos: new THREE.Vector3(Math.sin(a) * R, 0, Math.cos(a) * R - R), rotY: a, scale, a };
    });
  }, [items, n, arrangement, focus]);

  useEffect(() => {
    // arc: rotate so the focus item faces the camera
    const p = placements[Math.min(focus, n - 1)] as { a?: number };
    spinTarget.current = arrangement === 'arc' ? -(p?.a ?? 0) : 0;
    if (root.current) {
      const kids = root.current.children;
      gsap.fromTo(
        kids.map((k) => k.scale),
        { x: 0.6, y: 0.6, z: 0.6 },
        { x: 1, y: 1, z: 1, duration: 1.1, stagger: 0.07, delay: 0.25, ease: 'expo.out' },
      );
    }
  }, [focus, arrangement, n, placements]);

  useFrame((s, dt) => {
    const g = root.current;
    if (!g) return;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, spinTarget.current + pointer.x * 0.12, 2.4, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -pointer.y * 0.06 + Math.sin(s.clock.elapsedTime * 0.3) * 0.015, 2, dt);
  });

  return (
    <group ref={root}>
      {items.map((it, i) => {
        const p = placements[i];
        return (
          <group key={`${it.src}-${i}`} position={p.pos} rotation={[0, p.rotY, 0]} scale={p.scale}>
            <Frame src={it.src} label={it.label} framed={frame} focus={i === focus} />
          </group>
        );
      })}
    </group>
  );
}
