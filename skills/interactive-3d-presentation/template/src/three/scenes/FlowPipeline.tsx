import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { theme } from '../../content';
import type { FlowScene } from '../../types';
import { toneHex } from '../../lib/tone';
import { dotsMaterial, flowTubeMaterial, GLOW_BLEND, randAttr } from '../materials';
import { Label } from '../fade';
import { gsap } from '../../motion/gsap';

const PARTICLES = 140;

/** Process / value chain: a glowing pipe through step rings, particles streaming from first to last step. */
export function FlowPipeline({ spec }: { spec: FlowScene; active: boolean }) {
  const steps = spec.state.steps;
  const active = spec.state.active ?? -1;
  const { size, viewport } = useThree();
  const n = steps.length;

  const { curve, nodes } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      pts.push(new THREE.Vector3((t - 0.5) * 3.8, Math.sin(t * Math.PI * 1.3 + 0.4) * 0.75 - 0.2, Math.cos(t * Math.PI) * 0.6));
    }
    const ext = [pts[0].clone().add(new THREE.Vector3(-0.6, -0.3, 0)), ...pts, pts[n - 1].clone().add(new THREE.Vector3(0.6, 0.3, 0))];
    return { curve: new THREE.CatmullRomCurve3(ext, false, 'centripetal'), nodes: pts };
  }, [n]);

  const tubeMat = useMemo(() => flowTubeMaterial(theme.colors.accent, 0.35), []);
  const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 240, 0.016, 8, false), [curve]);

  const partGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PARTICLES * 3), 3));
    g.setAttribute('aRand', randAttr(PARTICLES));
    return g;
  }, []);
  const partMat = useMemo(() => {
    const m = dotsMaterial(theme.colors.accent, 7, 0, 1);
    m.blending = GLOW_BLEND;
    return m;
  }, []);
  const seeds = useMemo(() => Array.from({ length: PARTICLES }, () => [Math.random(), 0.04 + Math.random() * 0.06, (Math.random() - 0.5) * 0.08] as const), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    tubeMat.uniforms.uReveal.value = 0;
    const tw = gsap.to(tubeMat.uniforms.uReveal, { value: 1, duration: 2, delay: 0.4, ease: 'power2.inOut' });
    return () => {
      tw.kill();
    };
  }, [tubeGeo, tubeMat]);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    tubeMat.uniforms.uTime.value = t;
    partMat.uniforms.uVH.value = size.height * viewport.dpr;
    const reveal = tubeMat.uniforms.uReveal.value as number;
    const arr = partGeo.getAttribute('position').array as Float32Array;
    for (let i = 0; i < PARTICLES; i++) {
      const [o, sp, j] = seeds[i];
      const u = ((o + t * sp) % 1) * reveal;
      curve.getPointAt(u, tmp);
      arr[i * 3] = tmp.x + Math.sin(t + i) * j;
      arr[i * 3 + 1] = tmp.y + Math.cos(t * 1.3 + i) * j;
      arr[i * 3 + 2] = tmp.z + j;
    }
    partGeo.getAttribute('position').needsUpdate = true;
  });

  return (
    <group rotation={[0.15, -0.25, 0]}>
      <mesh geometry={tubeGeo} material={tubeMat} />
      <points geometry={partGeo} material={partMat} frustumCulled={false} />
      {nodes.map((p, i) => {
        const tone = steps[i].tone ?? (i === n - 1 ? 'accent' : 'ink');
        const color = toneHex(tone);
        const on = i === active;
        return (
          <group key={i} position={p}>
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[on ? 0.26 : 0.19, on ? 0.022 : 0.012, 12, 64]} />
              <meshBasicMaterial color={color} transparent opacity={on ? 1 : 0.75} toneMapped={false} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshBasicMaterial color={color} transparent toneMapped={false} />
            </mesh>
            <Label
              position={[0, i % 2 === 0 ? 0.52 : -0.52, 0]}
              sub={String(i + 1).padStart(2, '0')}
              text={steps[i].label}
              color={on ? theme.colors.accent : undefined}
            />
          </group>
        );
      })}
    </group>
  );
}
