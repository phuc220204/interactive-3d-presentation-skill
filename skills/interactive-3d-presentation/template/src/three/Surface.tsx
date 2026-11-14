import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { theme } from '../content';
import { stage } from '../deck/Stage16x9';

const KIND = { plain: 0, grid: 1, dots: 2, lined: 3, blueprint: 4, paper: 5, chalk: 6, drafting: 7 } as const;

const frag = /* glsl */ `
uniform vec3 uBg; uniform vec3 uLine; uniform vec3 uAccent;
uniform float uKind; uniform float uPx; uniform vec2 uOrigin; uniform float uTime;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
// anti-aliased grid line mask; p in design px
float grid(vec2 p, float s, float w) {
  vec2 g = abs(fract(p / s - 0.5) - 0.5) * s;
  vec2 aa = fwidth(p) * 0.75;
  vec2 l = 1.0 - smoothstep(vec2(w * 0.5) - aa, vec2(w * 0.5) + aa, g);
  return max(l.x, l.y);
}

void main() {
  // design-pixel coordinates anchored to the 16:9 stage (pattern scales with the slide)
  vec2 p = (gl_FragCoord.xy - uOrigin) / uPx;
  vec3 col = uBg;
  float k = uKind;
  if (k > 0.5 && k < 1.5) {               // whiteboard grid
    col = mix(col, uLine, grid(p, 48.0, 1.2) * 0.75);
  } else if (k < 2.5 && k > 1.5) {        // dot grid
    vec2 c = fract(p / 36.0) - 0.5;
    float d = length(c) * 36.0;
    col = mix(col, uLine, (1.0 - smoothstep(1.3, 2.3, d)) * 0.9);
  } else if (k < 3.5 && k > 2.5) {        // ruled notebook + red margin
    float l = 1.0 - smoothstep(0.0, 1.4, abs(mod(p.y, 46.0) - 1.0));
    col = mix(col, uLine, l * 0.85);
    float m = 1.0 - smoothstep(0.0, 1.6, abs(p.x - 96.0));
    col = mix(col, uAccent, m * 0.55);
  } else if (k < 4.5 && k > 3.5) {        // blueprint: minor + major grid
    col = mix(col, uLine, grid(p, 24.0, 1.0) * 0.45);
    col = mix(col, mix(uLine, vec3(1.0), 0.25), grid(p, 120.0, 1.6) * 0.8);
  } else if (k < 5.5 && k > 4.5) {        // paper fibres + tooth
    float n = fbm(p * 0.012) * 0.6 + fbm(p * 0.09) * 0.4;
    col *= 0.955 + 0.06 * n;
    col -= (hash(floor(p * 0.75)) > 0.996 ? 0.06 : 0.0);
  } else if (k > 6.5) {                   // drafting: tracing paper, 16px minor + 80px major grid
    col = mix(col, uLine, grid(p, 16.0, 1.0) * 0.32);
    col = mix(col, uLine, grid(p, 80.0, 1.4) * 0.85);
    col *= 0.985 + 0.03 * fbm(p * 0.02);
  } else if (k > 5.5) {                   // chalk smudges
    float s = fbm(p * 0.0035 + vec2(3.1, 7.7));
    col = mix(col, uLine, smoothstep(0.45, 0.9, s) * 0.35);
    col += (fbm(p * 0.6) - 0.5) * 0.03;
  }
  // soft vignette toward the theme background edges
  float v = smoothstep(1.25, 0.35, distance(vUv, vec2(0.5)));
  col = mix(col * (uKind > 4.5 && uKind < 5.5 ? 0.93 : 1.0), col, v);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

/** Full-screen procedural background (grid / dots / ruled / blueprint / paper / chalk) under every scene. */
export function Surface() {
  const { size, viewport } = useThree();
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uBg: { value: new THREE.Color(theme.colors.bg) },
          uLine: { value: new THREE.Color(theme.colors.line) },
          uAccent: { value: new THREE.Color(theme.colors.alert) },
          uKind: { value: KIND[theme.surface] },
          uPx: { value: 1 },
          uOrigin: { value: new THREE.Vector2() },
          uTime: { value: 0 },
        },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }',
        fragmentShader: frag,
        depthWrite: false,
        depthTest: false,
        fog: false,
      }),
    [],
  );
  useFrame(() => {
    const dpr = viewport.dpr;
    mat.uniforms.uPx.value = stage.scale * dpr;
    // gl_FragCoord origin is bottom-left
    mat.uniforms.uOrigin.value.set(stage.left * dpr, (size.height - stage.top - stage.height) * dpr);
  });
  if (theme.surface === 'plain') return null;
  return (
    <mesh renderOrder={-100} frustumCulled={false} material={mat}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
