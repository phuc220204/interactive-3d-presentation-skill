import { useEffect, useRef, useState, type ReactElement } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { Bloom, ChromaticAberration, DepthOfField, DotScreen, EffectComposer, Noise, Sepia, TiltShift2 } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { slides, theme } from '../content';
import { useDeck } from '../deck/store';
import { pointer, reducedMotion } from '../lib/pointer';
import type { Layout, SceneName, SceneSpec } from '../types';
import { CAM_Z, FOV, SceneSlot } from './SceneSlot';
import { SCENES } from './registry';
import { sceneAt } from '../deck/beats';
import { mediaIndex } from '../layouts/media';
import { cameraSequence, type CameraSeq } from './theatre';
import { BackdropDirector } from './Backdrop';
import { Surface } from './Surface';

/** Default anchor (fraction of the 16:9 stage) and presence for each layout. */
const LAYOUT_STAGE: Record<Layout, { anchor: [number, number]; dim: number }> = {
  cover: { anchor: [0.73, 0.5], dim: 1 },
  split: { anchor: [0.74, 0.52], dim: 1 },
  'split-right': { anchor: [0.27, 0.52], dim: 1 },
  center: { anchor: [0.5, 0.5], dim: 0.45 },
  grid: { anchor: [0.5, 0.56], dim: 0.32 },
  full: { anchor: [0.62, 0.46], dim: 1 },
  references: { anchor: [0.86, 0.5], dim: 0.35 },
  section: { anchor: [0.78, 0.5], dim: 0.45 },
};

/** Pointer parallax at rest; plays a Theatre.js sequence when the slide declares `camera.sequence`. */
function CameraRig() {
  const cam = useDeck((s) => slides[s.index].camera);
  const seq = useRef<CameraSeq | null>(null);
  const look = useRef(new THREE.Vector3());

  useEffect(() => {
    seq.current = null;
    if (!cam?.sequence || reducedMotion()) return; // reduced motion: no camera flights
    let alive = true;
    cameraSequence(cam.sequence, cam.duration)
      .then((s) => {
        if (!alive) return;
        seq.current = s;
        s.play();
      })
      .catch((e) => console.warn('[deck] Theatre.js sequence failed:', cam.sequence, e));
    return () => {
      alive = false;
      seq.current?.stop();
    };
  }, [cam?.sequence, cam?.duration]);

  useFrame(({ camera }, dt) => {
    if (seq.current) {
      const v = seq.current.obj.value;
      camera.position.set(v.position.x + pointer.x * 0.15, v.position.y + pointer.y * 0.1, v.position.z);
      look.current.set(v.target.x, v.target.y, v.target.z);
      camera.lookAt(look.current);
      return;
    }
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.35, 2.2, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, pointer.y * 0.22, 2.2, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, CAM_Z, 2.2, dt);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

interface Mounted {
  name: SceneName;
  spec: SceneSpec;
  active: boolean;
}

/** Keeps one instance per scene type alive; same type across slides = continuous morph, not a remount. */
function SceneDirector() {
  const index = useDeck((s) => s.index);
  const beat = useDeck((s) => s.beat);
  const slide = slides[index];
  const layout = slide.layout ?? 'split';
  const conf = LAYOUT_STAGE[layout];
  // a 2D hero visual occupies the scene's region → the ambient scene stays as a faint backdrop
  const dim = conf.dim * (mediaIndex(slide) >= 0 ? 0.14 : 1);
  // scene state can change per beat (slide.sceneBeats) — same scene instance, new state → smooth internal transition
  const spec = sceneAt(slide, beat);
  const [mounted, setMounted] = useState<Mounted[]>(() => [{ name: spec.name, spec, active: true }]);

  useEffect(() => {
    setMounted((list) => {
      const name = spec.name;
      const next = list.map((m) => (m.name === name ? { ...m, spec, active: true } : { ...m, active: false }));
      if (!next.some((m) => m.name === name)) next.push({ name, spec, active: true });
      return next;
    });
  }, [index, beat]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {mounted.map((m) => {
        const Comp = SCENES[m.name] as React.ComponentType<{ spec: SceneSpec; active: boolean }>;
        const anchor = (m.active ? m.spec.anchor : undefined) ?? conf.anchor;
        return (
          <SceneSlot
            key={m.name}
            active={m.active}
            dim={dim}
            anchor={m.active ? anchor : (m.spec.anchor ?? conf.anchor)}
            scale={m.spec.scale ?? 1}
            onGone={() => setMounted((l) => l.filter((x) => x.name !== m.name || x.active))}
          >
            <Comp spec={m.spec} active={m.active} />
          </SceneSlot>
        );
      })}
    </>
  );
}

/** Post-processing from the theme: bloom + optional looks (theme.effects). Nothing renders when all are off. */
function Effects() {
  const fx = theme.effects ?? {};
  const list = [
    theme.bloom > 0 && <Bloom key="bloom" mipmapBlur intensity={theme.bloom} luminanceThreshold={0.32} luminanceSmoothing={0.2} />,
    fx.dof && <DepthOfField key="dof" focusDistance={0.02} focalLength={0.05} bokehScale={2.5} />,
    fx.tiltShift && <TiltShift2 key="tilt" blur={0.12} />,
    fx.chromatic && <ChromaticAberration key="ca" offset={new THREE.Vector2(fx.chromatic, fx.chromatic)} radialModulation={false} modulationOffset={0} />,
    fx.sepia && <Sepia key="sepia" intensity={fx.sepia} />,
    fx.halftone && <DotScreen key="dots" blendFunction={BlendFunction.OVERLAY} scale={1.4} angle={Math.PI * 0.25} />,
    fx.noise && <Noise key="noise" opacity={fx.noise} premultiply />,
  ].filter(Boolean) as ReactElement[];
  if (!list.length) return null;
  return <EffectComposer multisampling={0}>{list}</EffectComposer>;
}

export default function Stage() {
  const [degraded, setDegraded] = useState(false);
  const [dpr, setDpr] = useState(1.75);
  const wrap = useRef<HTMLDivElement>(null);
  return (
    <div ref={wrap} className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <Canvas
        dpr={[1, dpr]}
        camera={{ fov: FOV, position: [0, 0, CAM_Z], near: 0.1, far: 100 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(theme.colors.bg, 1);
          scene.fog = new THREE.Fog(theme.colors.bg, 14, 30);
        }}
      >
        <PerformanceMonitor
          onDecline={() => {
            setDpr(1);
            setDegraded(true);
          }}
          onIncline={() => setDpr(1.75)}
        />
        <ambientLight intensity={theme.mode === 'light' ? 0.9 : 0.55} />
        <directionalLight position={[4, 6, 5]} intensity={1.6} />
        <pointLight position={[-4, -2, 4]} intensity={18} color={theme.colors.accent} distance={14} />
        <CameraRig />
        <Surface />
        <BackdropDirector />
        <SceneDirector />
        {!degraded && <Effects />}
      </Canvas>
    </div>
  );
}
