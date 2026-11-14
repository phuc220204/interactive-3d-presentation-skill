import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { theme } from '../../content';
import type { TimelineScene } from '../../types';
import { toneHex } from '../../lib/tone';
import { Label } from '../fade';

const STEP_A = 0.95; // radians between milestones
const STEP_Y = 0.62;
const RAD = 1.35;

/** Milestones on a rising helix. The `active` milestone rotates to face the viewer and glows. */
export function TimelineHelix({ spec }: { spec: TimelineScene; active: boolean }) {
  const items = spec.state.items;
  const n = items.length;
  const active = Math.min(n - 1, Math.max(0, spec.state.active ?? n - 1));
  const spin = useRef<THREE.Group>(null);
  const lift = useRef<THREE.Group>(null);

  const pts = useMemo(
    () => items.map((_, i) => new THREE.Vector3(Math.cos(i * STEP_A) * RAD, (i - (n - 1) / 2) * STEP_Y, Math.sin(i * STEP_A) * RAD)),
    [items, n],
  );
  const spine = useMemo(() => {
    const dense: THREE.Vector3[] = [];
    for (let k = -0.6; k <= n - 1 + 0.6; k += 0.05) dense.push(new THREE.Vector3(Math.cos(k * STEP_A) * RAD, (k - (n - 1) / 2) * STEP_Y, Math.sin(k * STEP_A) * RAD));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(dense), 400, 0.008, 6, false);
  }, [n]);
  // progress segment up to the active milestone
  const done = useMemo(() => {
    const dense: THREE.Vector3[] = [];
    for (let k = -0.6; k <= active + 0.001; k += 0.05) dense.push(new THREE.Vector3(Math.cos(k * STEP_A) * RAD, (k - (n - 1) / 2) * STEP_Y, Math.sin(k * STEP_A) * RAD));
    return dense.length > 1 ? new THREE.TubeGeometry(new THREE.CatmullRomCurve3(dense), 300, 0.016, 8, false) : null;
  }, [active, n]);

  useFrame((s, dt) => {
    // bring the active node to the front (+z) and vertical centre
    const target = active * STEP_A - Math.PI / 2;
    if (spin.current) {
      let d = target - spin.current.rotation.y;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      spin.current.rotation.y += d * (1 - Math.exp(-2.5 * dt)) + Math.sin(s.clock.elapsedTime * 0.3) * 0.0006;
    }
    if (lift.current) lift.current.position.y = THREE.MathUtils.damp(lift.current.position.y, -(active - (n - 1) / 2) * STEP_Y, 2.5, dt);
  });

  return (
    <group rotation={[0.22, 0, 0.08]}>
      <group ref={lift}>
        <group ref={spin}>
          <mesh geometry={spine}>
            <meshBasicMaterial color={theme.colors.ink} transparent opacity={0.22} />
          </mesh>
          {done && (
            <mesh geometry={done}>
              <meshBasicMaterial color={theme.colors.accent} transparent opacity={0.95} toneMapped={false} />
            </mesh>
          )}
          {items.map((it, i) => {
            const on = i === active;
            const past = i < active;
            const color = toneHex(it.tone, on || past ? 'accent' : 'muted');
            return (
              <group key={i} position={pts[i]}>
                <mesh>
                  <sphereGeometry args={[on ? 0.12 : 0.07, 24, 24]} />
                  <meshBasicMaterial color={color} transparent toneMapped={false} />
                </mesh>
                {on && (
                  <mesh>
                    <sphereGeometry args={[0.28, 24, 24]} />
                    <meshBasicMaterial color={color} transparent opacity={0.12} depthWrite={false} />
                  </mesh>
                )}
                <Label position={[0.22, 0, 0]} align="left" visible={Math.abs(i - active) <= 2} text={it.label} color={on ? theme.colors.accent : undefined} dim={!on} />
              </group>
            );
          })}
        </group>
      </group>
    </group>
  );
}
