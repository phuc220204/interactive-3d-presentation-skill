import * as THREE from 'three';
import { theme } from '../content';

/**
 * Theme-aware blending: additive light on dark themes ("glow"), normal ink on light / matte themes.
 * Use GLOW_BLEND for any line/particle material so scenes read on every preset.
 */
export const GLOW = theme.glow;
export const GLOW_BLEND = theme.glow ? THREE.AdditiveBlending : THREE.NormalBlending;

/**
 * Round, depth-attenuated, back-face-dimmed dots. Used by the globe and ambient fields.
 * Uniforms: uColor, uSize (px at 1080p), uVH (drawing-buffer height), uFade, uFacing (1 = dim dots facing away).
 */
export function dotsMaterial(color: string, size = 3, facing = 1, opacity = 1) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uSize: { value: size },
      uVH: { value: 1080 },
      uFade: { value: 1 },
      uFacing: { value: facing },
      uOpacity: { value: opacity },
    },
    vertexShader: /* glsl */ `
      uniform float uSize; uniform float uVH; uniform float uFacing;
      attribute float aRand;
      varying float vAlpha;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec3 n = normalize(normalMatrix * normalize(position));
        float f = dot(n, normalize(-mv.xyz));
        vAlpha = mix(1.0, smoothstep(-0.15, 0.45, f), uFacing) * (0.65 + 0.35 * aRand);
        float scaleWorld = length(vec3(modelMatrix[0][0], modelMatrix[0][1], modelMatrix[0][2]));
        gl_PointSize = uSize * (uVH / 1080.0) * (10.0 / -mv.z) * max(scaleWorld, 0.4);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uFade; uniform float uOpacity;
      varying float vAlpha;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.32, d);
        gl_FragColor = vec4(uColor, a * vAlpha * uFade * uOpacity);
  #include <colorspace_fragment>
      }`,
  });
}

/**
 * Tube material with a glowing pulse travelling along uv.x and a reveal mask (uReveal 0→1 draws the path).
 */
export function flowTubeMaterial(color: string, base = 0.28) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: GLOW_BLEND,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uGlow: { value: GLOW ? 1 : 0 },
      uTime: { value: 0 },
      uFade: { value: 1 },
      uReveal: { value: 0 },
      uBase: { value: base },
      uSpeed: { value: 0.35 },
      uOffset: { value: Math.random() },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uGlow; uniform float uTime; uniform float uFade; uniform float uReveal; uniform float uBase; uniform float uSpeed; uniform float uOffset;
      varying vec2 vUv;
      void main() {
        if (vUv.x > uReveal) discard;
        float head = fract(uTime * uSpeed + uOffset);
        float dd = vUv.x - head;
        float pulse = exp(-pow(dd * 14.0, 2.0)) + exp(-pow((dd + 1.0) * 14.0, 2.0));
        float edge = smoothstep(0.0, 0.04, vUv.x) * smoothstep(1.0, 0.96, vUv.x);
        // glow: faint line + bright travelling pulse; ink: solid line + darker travelling pulse
        float a = mix(min(1.0, uBase * 2.6 + pulse * 0.6), uBase + pulse * 1.6, uGlow) * edge;
        vec3 c = mix(uColor * (1.0 - pulse * 0.35), uColor * (1.0 + pulse * 1.5), uGlow);
        gl_FragColor = vec4(c, min(a, 1.0) * uFade);
  #include <colorspace_fragment>
      }`,
  });
}

/** Fresnel atmosphere shell (render with BackSide). */
export function atmosphereMaterial(color: string, power = 2.6, strength = 0.9) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    blending: GLOW_BLEND,
    uniforms: { uColor: { value: new THREE.Color(color) }, uFade: { value: 1 }, uPower: { value: power }, uStrength: { value: strength } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uFade; uniform float uPower; uniform float uStrength;
      varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(1.0 - abs(dot(vN, vV)), uPower);
        gl_FragColor = vec4(uColor, f * uStrength * uFade);
  #include <colorspace_fragment>
      }`,
  });
}

/** Random attribute 0..1 per vertex (for twinkle / stagger). */
export function randAttr(count: number) {
  const a = new Float32Array(count);
  for (let i = 0; i < count; i++) a[i] = Math.random();
  return new THREE.BufferAttribute(a, 1);
}
