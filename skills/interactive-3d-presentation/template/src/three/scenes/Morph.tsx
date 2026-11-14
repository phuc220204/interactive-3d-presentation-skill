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

const N = 7000;

// deterministic PRNG so shapes are stable between renders
function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
function gauss(r: () => number) {
  return Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
}

/** Target point clouds. Each returns N xyz triplets roughly inside radius 2. */
export function shapePoints(shape: MorphShape): Float32Array {
  const a = new Float32Array(N * 3);
  const r = rng(shape.length * 7919 + shape.charCodeAt(0));
  for (let i = 0; i < N; i++) {
    let x = 0, y = 0, z = 0;
    const t = i / N;
    switch (shape) {
      case 'sphere': {
        const yy = 1 - t * 2, rad = Math.sqrt(1 - yy * yy), th = Math.PI * (3 - Math.sqrt(5)) * i;
        x = Math.cos(th) * rad * 1.75; y = yy * 1.75; z = Math.sin(th) * rad * 1.75;
        break;
      }
      case 'grid': {
        const side = Math.ceil(Math.sqrt(N)); const gx = i % side, gz = Math.floor(i / side);
        x = (gx / side - 0.5) * 4; z = (gz / side - 0.5) * 4; y = 0;
        [y, z] = [z * Math.sin(-1.0), z * Math.cos(-1.0)];
        break;
      }
      case 'wave': {
        const side = Math.ceil(Math.sqrt(N)); const gx = i % side, gz = Math.floor(i / side);
        x = (gx / side - 0.5) * 4.2; z = (gz / side - 0.5) * 4.2;
        y = Math.sin(x * 1.6) * 0.35 + Math.cos(z * 1.9) * 0.3;
        [y, z] = [y * Math.cos(-0.9) - z * Math.sin(-0.9), y * Math.sin(-0.9) + z * Math.cos(-0.9)];
        break;
      }
      case 'cluster': {
        const k = i % 7; const ang = k * 2.39996; const rr = k === 0 ? 0 : 1.35;
        const cx = Math.cos(ang) * rr, cy = Math.sin(ang) * rr * 0.8, cz = Math.sin(ang * 1.7) * 0.6;
        const s = k === 0 ? 0.28 : 0.2;
        x = cx + gauss(r) * s; y = cy + gauss(r) * s; z = cz + gauss(r) * s;
        break;
      }
      case 'converge': {
        const core = r() < 0.72; const s = core ? 0.32 : 1.4;
        x = gauss(r) * s; y = gauss(r) * s; z = gauss(r) * s;
        if (!core) { const l = Math.hypot(x, y, z) || 1; const R = 1.3 + r() * 0.7; x = (x / l) * R; y = (y / l) * R; z = (z / l) * R; }
        break;
      }
      case 'split': {
        const side = i % 2 === 0 ? -1 : 1;
        x = side * 1.15 + gauss(r) * 0.42; y = gauss(r) * 0.55; z = gauss(r) * 0.42;
        if (r() < 0.06) { x = (r() - 0.5) * 0.9; y = (r() - 0.5) * 0.5; } // sparks in the gap
        break;
      }
      case 'ring': {
        const u = t * Math.PI * 2 * 40, v = r() * Math.PI * 2;
        const R = 1.6, rr = 0.18 + r() * 0.06;
        x = (R + rr * Math.cos(v)) * Math.cos(u); y = (R + rr * Math.cos(v)) * Math.sin(u) * 0.35; z = rr * Math.sin(v) + (R + rr * Math.cos(v)) * Math.sin(u) * 0.9;
        break;
      }
      case 'helix': {
        const strand = i % 2; const u = t * Math.PI * 7;
        x = Math.cos(u + strand * Math.PI) * 0.85 + gauss(r) * 0.04; z = Math.sin(u + strand * Math.PI) * 0.85 + gauss(r) * 0.04; y = (t - 0.5) * 3.8;
        if (r() < 0.12) { const m = r() * 2 - 1; x = Math.cos(u) * 0.85 * m; z = Math.sin(u) * 0.85 * m; }
        break;
      }
      case 'cube': {
        const f = Math.floor(r() * 6), u = r() * 2 - 1, v = r() * 2 - 1, s = 1.25;
        const p = [[1, u, v], [-1, u, v], [u, 1, v], [u, -1, v], [u, v, 1], [u, v, -1]][f];
        x = p[0] * s; y = p[1] * s; z = p[2] * s;
        break;
      }
      case 'person': {
        // head (sphere) + shoulders/body (rounded trapezoid), slight depth
        if (r() < 0.28) {
          const u = r() * Math.PI * 2, v = Math.acos(2 * r() - 1), R = 0.48 * Math.cbrt(r());
          x = R * Math.sin(v) * Math.cos(u); y = 1.15 + R * Math.cos(v); z = R * Math.sin(v) * Math.sin(u);
        } else {
          const yy = r(); const half = 0.55 + yy * 0.75;
          x = (r() * 2 - 1) * half; y = 0.5 - yy * 2.1; z = gauss(r) * 0.12;
          if (yy < 0.08) x *= 0.75;
        }
        break;
      }
      case 'gear': {
        const teeth = 12; const u = r() * Math.PI * 2;
        const tooth = Math.cos(u * teeth) > 0.2 ? 1 : 0;
        const R = r() < 0.2 ? 0.35 + r() * 0.15 : 1.25 + tooth * 0.35 * r();
        const rr = r() < 0.75 ? R : 0.5 + r() * (R - 0.5);
        x = Math.cos(u) * rr; y = Math.sin(u) * rr; z = (r() - 0.5) * 0.35;
        break;
      }
      case 'chip': {
        if (r() < 0.65) { x = (r() * 2 - 1) * 1.05; y = (r() * 2 - 1) * 1.05; z = (r() - 0.5) * 0.18; }
        else {
          const side = Math.floor(r() * 4), k = Math.floor(r() * 6), along = -0.85 + k * 0.34, out = 1.1 + r() * 0.5;
          const p = [[along, out], [along, -out], [out, along], [-out, along]][side];
          x = p[0] + gauss(r) * 0.02; y = p[1]; z = gauss(r) * 0.03;
        }
        break;
      }
      case 'house': {
        const roof = r() < 0.38;
        if (roof) { const yy = r(); x = (r() * 2 - 1) * 1.45 * (1 - yy); y = 0.45 + yy * 1.2; }
        else { x = (r() * 2 - 1) * 1.1; y = 0.45 - r() * 1.9; if (Math.abs(x) < 0.25 && y < -0.6) { x += 0.6; } }
        z = (r() - 0.5) * 0.4;
        break;
      }
      case 'arrow': {
        if (r() < 0.45) { const yy = r(); x = (r() * 2 - 1) * 1.2 * (1 - yy); y = 0.5 + yy * 1.3; }
        else { x = (r() * 2 - 1) * 0.42; y = 0.5 - r() * 2.2; }
        z = (r() - 0.5) * 0.3;
        break;
      }
      default: {
        x = (r() - 0.5) * 4.6; y = (r() - 0.5) * 3.2; z = (r() - 0.5) * 3;
      }
    }
    a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
  }
  return a;
}

/**
 * Point cloud filling an SVG path (viewBox 0 0 100 100, y down) — any silhouette: a country, a logo, a product.
 * Uses Canvas 2D isPointInPath; falls back to scatter when the path is invalid.
 */
const pathCache = new Map<string, Float32Array>();
export function pathPoints(d: string): Float32Array {
  if (pathCache.has(d)) return pathCache.get(d)!;
  const a = shapePoints('scatter');
  try {
    const ctx = document.createElement('canvas').getContext('2d')!;
    const p = new Path2D(d);
    const r = rng(d.length * 131 + 7);
    let i = 0;
    for (let tries = 0; i < N && tries < N * 60; tries++) {
      const px = r() * 100, py = r() * 100;
      if (!ctx.isPointInPath(p, px, py)) continue;
      a[i * 3] = (px - 50) / 26;
      a[i * 3 + 1] = (50 - py) / 26;
      a[i * 3 + 2] = gauss(r) * 0.08;
      i++;
    }
    if (i < N * 0.5) throw new Error('path too small');
    for (; i < N; i++) { const k = Math.floor(r() * (i - 1)); a[i * 3] = a[k * 3]; a[i * 3 + 1] = a[k * 3 + 1]; a[i * 3 + 2] = a[k * 3 + 2]; }
  } catch (e) {
    console.warn('[deck] morph path invalid:', d.slice(0, 60), e);
  }
  pathCache.set(d, a);
  return a;
}

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
