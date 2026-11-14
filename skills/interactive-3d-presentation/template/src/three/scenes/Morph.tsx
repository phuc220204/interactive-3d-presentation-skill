import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { theme } from '../../content';
import type { MorphScene, MorphShape } from '../../types';
import { toneHex } from '../../lib/tone';
import { GLOW_BLEND } from '../materials';
import { gsap } from '../../motion/gsap';
import { Label } from '../fade';
import { reducedMotion } from '../../lib/pointer';

import { N, pathPoints, shapePoints } from '../../lib/morphPoints';
export { shapePoints, pathPoints };

const vert = /* glsl */ `
uniform float uT; uniform float uTime; uniform float uVH; uniform float uSize; uniform float uSplit;
attribute vec3 aFrom; attribute vec3 aTo; attribute float aRand;
varying float vMix; varying float vA;
void main() {
  float t = clamp(uT * 1.5 - aRand * 0.5, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  vec3 p = mix(aFrom, aTo, t);
  p += 0.03 * vec3(sin(uTime * 0.7 + aRand * 40.0), cos(uTime * 0.6 + aRand * 31.0), sin(uTime * 0.5 + aRand * 17.0));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vMix = mix(step(0.85, aRand) * 0.9, step(0.0, p.x), uSplit);
  vA = 0.45 + 0.55 * aRand;
  float sw = length(vec3(modelMatrix[0][0], modelMatrix[0][1], modelMatrix[0][2]));
  gl_PointSize = uSize * (uVH / 1080.0) * (10.0 / -mv.z) * max(sw, 0.4) * (0.6 + aRand * 0.8);
  gl_Position = projectionMatrix * mv;
}`;
const frag = /* glsl */ `
uniform vec3 uA; uniform vec3 uB; uniform float uFade;
varying float vMix; varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.1, d);
  gl_FragColor = vec4(mix(uA, uB, vMix), a * vA * uFade);
  #include <colorspace_fragment>
}`;

/**
 * Concept particles: 7k points morph between abstract shapes when the slide changes —
 * fragmentation (cluster) → unity (converge), conflict (split), system (grid/cube), cycle (ring/helix)…
 */
export function Morph({ spec }: { spec: MorphScene; active: boolean }) {
  const stages = spec.state.stages;
  const [stage, setStage] = useState(0);
  // autoplay stages (a story in shapes: weave → assembly line → chip → network…)
  useEffect(() => {
    setStage(0);
    if (!stages?.length || reducedMotion()) return;
    const id = window.setInterval(() => setStage((k) => (k + 1) % stages.length), (spec.state.stageSeconds ?? 6) * 1000);
    return () => window.clearInterval(id);
  }, [stages, spec.state.stageSeconds]);
  const cur = stages?.length ? stages[Math.min(stage, stages.length - 1)] : spec.state;
  const shape: MorphShape = cur.shape ?? 'scatter';
  const path = cur.path;
  const tone = spec.state.tone;
  const { size, viewport } = useThree();
  const pts = useRef<THREE.Points>(null);
  const prog = useRef({ v: 0 }).current;

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const scatter = shapePoints('scatter');
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    g.setAttribute('aFrom', new THREE.BufferAttribute(scatter.slice(), 3));
    g.setAttribute('aTo', new THREE.BufferAttribute(scatter.slice(), 3));
    const rnd = new Float32Array(N);
    for (let i = 0; i < N; i++) rnd[i] = Math.random();
    g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
    return g;
  }, []);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        blending: GLOW_BLEND,
        uniforms: {
          uT: { value: 0 },
          uTime: { value: 0 },
          uVH: { value: 1080 },
          uSize: { value: 3.2 },
          uSplit: { value: 0 },
          uA: { value: new THREE.Color(theme.colors.ink) },
          uB: { value: new THREE.Color(theme.colors.accent) },
          uFade: { value: 1 },
        },
      }),
    [],
  );

  useEffect(() => {
    // freeze current interpolated positions as the new "from"
    const from = geo.getAttribute('aFrom') as THREE.BufferAttribute;
    const to = geo.getAttribute('aTo') as THREE.BufferAttribute;
    const k = Math.min(1, prog.v);
    for (let i = 0; i < N * 3; i++) (from.array as Float32Array)[i] = (from.array as Float32Array)[i] * (1 - k) + (to.array as Float32Array)[i] * k;
    (to.array as Float32Array).set(path ? pathPoints(path) : shapePoints(shape));
    from.needsUpdate = true;
    to.needsUpdate = true;
    prog.v = 0;
    const tw = gsap.to(prog, { v: 1, duration: 2.4, ease: 'power2.inOut' });
    // colours: split = accent vs alert, otherwise ink with tone sparks
    const split = shape === 'split';
    gsap.to(mat.uniforms.uSplit, { value: split ? 1 : 0, duration: 1.2 });
    const a = new THREE.Color(split ? theme.colors.accent : theme.colors.ink);
    const b = new THREE.Color(split ? theme.colors.alert : toneHex(tone, 'accent'));
    gsap.to(mat.uniforms.uA.value, { r: a.r, g: a.g, b: a.b, duration: 1.2 });
    gsap.to(mat.uniforms.uB.value, { r: b.r, g: b.g, b: b.b, duration: 1.2 });
    return () => {
      tw.kill();
    };
  }, [shape, path, tone, geo, mat, prog]);

  useFrame((s, dt) => {
    mat.uniforms.uT.value = prog.v;
    mat.uniforms.uTime.value = s.clock.elapsedTime;
    mat.uniforms.uVH.value = size.height * viewport.dpr;
    if (pts.current) {
      const still = !!path || ['split', 'grid', 'wave', 'person', 'house', 'arrow', 'chip'].includes(shape);
      pts.current.rotation.y += dt * (still ? 0.02 : 0.07);
      if (still) pts.current.rotation.y = THREE.MathUtils.damp(pts.current.rotation.y, 0, 1.2, dt);
    }
  });

  return (
    <group>
      <points ref={pts} geometry={geo} material={mat} frustumCulled={false} />
      {stages?.length ? <Label position={[0, -2.35, 0]} text={`${stage + 1}/${stages.length} · ${stages[stage]?.label ?? ''}`} /> : null}
    </group>
  );
}
