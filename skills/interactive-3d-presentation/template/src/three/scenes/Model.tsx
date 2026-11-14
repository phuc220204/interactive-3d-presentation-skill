import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { gsap } from '../../motion/gsap';
import * as THREE from 'three';
import { theme } from '../../content';
import type { ModelScene } from '../../types';
import { pointer } from '../../lib/pointer';
import { asset } from '../../lib/asset';
import { Label } from '../fade';
import { Ambient } from './Ambient';

const FIT = 1.9; // radius the model is scaled to

class Fallback extends Component<{ children: ReactNode; fallback: ReactNode; src: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(e: unknown) {
    console.warn('[deck] 3D model failed to load, showing ambient scene instead:', this.props.src, e);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Loaded({ spec }: { spec: ModelScene }) {
  const { scene, animations } = useGLTF(asset(spec.state.src));
  const turn = useRef<THREE.Group>(null);
  const { object, size, inner } = useMemo(() => {
    const o = cloneSkinned(scene); // skeleton-safe clone (skinned meshes keep their bones)
    o.traverse((c) => {
      const m = (c as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (m) (c as THREE.Mesh).material = Array.isArray(m) ? m.map((x) => x.clone()) : m.clone();
    });
    const box = new THREE.Box3().setFromObject(o);
    const s = new THREE.Vector3();
    const c = new THREE.Vector3();
    box.getSize(s);
    box.getCenter(c);
    const k = (FIT * 2) / Math.max(s.x, s.y, s.z, 1e-6);
    o.position.sub(c);
    const wrap = new THREE.Group();
    wrap.add(o);
    wrap.scale.setScalar(k);
    return { object: wrap, size: s.multiplyScalar(k), inner: o };
  }, [scene]);

  // glTF animation clip (loops)
  const { actions } = useAnimations(animations, inner);
  useEffect(() => {
    const name = spec.state.clip;
    if (!name) return;
    const a = actions[name];
    if (!a) {
      console.warn('[deck] model clip not found:', name, Object.keys(actions));
      return;
    }
    a.reset().fadeIn(0.4).play();
    return () => {
      a.fadeOut(0.3);
    };
  }, [actions, spec.state.clip]);

  // morph targets: tween influences to the requested values (works with sceneBeats)
  const morphKey = JSON.stringify(spec.state.morph ?? {});
  useEffect(() => {
    const want = spec.state.morph;
    if (!want) return;
    const tws: gsap.core.Tween[] = [];
    object.traverse((c) => {
      const mesh = c as THREE.Mesh;
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
      for (const [name, v] of Object.entries(want)) {
        const idx = mesh.morphTargetDictionary[name];
        if (idx === undefined) continue;
        tws.push(gsap.to(mesh.morphTargetInfluences, { [idx]: v, duration: 1.2, ease: 'power2.inOut' }));
      }
    });
    return () => tws.forEach((x) => x.kill());
  }, [object, morphKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((st, dt) => {
    const g = turn.current;
    if (!g) return;
    if (spec.state.rotate !== false) g.rotation.y += dt * 0.25;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, (spec.state.tilt ?? 0.15) - pointer.y * 0.12, 2, dt);
    g.position.y = Math.sin(st.clock.elapsedTime * 0.6) * 0.04;
  });

  return (
    <group>
      <group ref={turn}>
        <primitive object={object} />
        {(spec.state.hotspots ?? []).map((h, i) => (
          <group key={i} position={[(h.at[0] * size.x) / 2, (h.at[1] * size.y) / 2, (h.at[2] * size.z) / 2]}>
            <mesh>
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshBasicMaterial color={theme.colors.accent} transparent toneMapped={false} />
            </mesh>
            <Label position={[0.12, 0.08, 0]} align="left" text={h.label} color={theme.colors.accent} />
          </group>
        ))}
      </group>
      {/* soft contact shadow disc */}
      <mesh position={[0, -size.y / 2 - 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[FIT * 0.8, 48]} />
        <meshBasicMaterial color={theme.mode === 'light' ? theme.colors.ink : '#000'} transparent opacity={theme.mode === 'light' ? 0.08 : 0.35} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** glTF/GLB model, auto-fitted and centred, turntable + pointer tilt, optional hotspot labels. */
export function Model({ spec, active }: { spec: ModelScene; active: boolean }) {
  const fallback = <Ambient spec={{ name: 'ambient' }} active={active} />;
  return (
    <Fallback fallback={fallback} src={spec.state.src}>
      <Suspense fallback={null}>
        <Loaded spec={spec} />
      </Suspense>
    </Fallback>
  );
}
