import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { slides, theme } from '../content';
import { useDeck } from '../deck/store';
import { asset } from '../lib/asset';
import { gsap } from '../motion/gsap';
import type { BackdropImage } from '../types';
import { CAM_Z, FOV } from './SceneSlot';

const DEPTH = 8; // plane sits at z = -DEPTH (behind every scene)

const vert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const frag = /* glsl */ `
uniform sampler2D uTex;
uniform vec3 uDark;
uniform vec3 uLight;
uniform vec3 uBg;
uniform float uMode;    // 0 duotone, 1 mono, 2 color
uniform float uFade;
uniform float uOpacity;
uniform vec2 uCover;    // uv scale for object-fit: cover
uniform float uTime;
varying vec2 vUv;
void main() {
  vec2 uv = (vUv - 0.5) * uCover + 0.5;
  uv += vec2(sin(uTime * 0.05), cos(uTime * 0.04)) * 0.004;
  vec3 c = texture2D(uTex, uv).rgb;
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  l = smoothstep(0.04, 0.96, l);
  vec3 duo = mix(uDark, uLight, l);
  vec3 mono = vec3(l) * 0.9;
  vec3 col = uMode < 0.5 ? duo : (uMode < 1.5 ? mono : c * 0.85);
  float d = distance(vUv, vec2(0.5));
  float vig = smoothstep(0.85, 0.25, d);
  gl_FragColor = vec4(mix(uBg, col, vig), uOpacity * uFade);
  #include <colorspace_fragment>
}
`;

function BackdropPlane({ img, active, onGone }: { img: BackdropImage; active: boolean; onGone: () => void }) {
  const { size } = useThree();
  const mat = useRef<THREE.ShaderMaterial>(null);
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const fade = useRef({ v: 0 }).current;

  useEffect(() => {
    let alive = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      asset(img.src),
      (t) => {
        if (!alive) return;
        t.colorSpace = THREE.SRGBColorSpace;
        setTex(t);
      },
      undefined,
      () => console.warn('[deck] backdrop image failed, falling back to plain background:', img.src),
    );
    return () => {
      alive = false;
    };
  }, [img.src]);

  useEffect(() => {
    if (!tex) return;
    const tw = gsap.to(fade, {
      v: active ? 1 : 0,
      duration: active ? 1.6 : 0.8,
      ease: 'power2.inOut',
      onComplete: () => !active && onGone(),
    });
    return () => {
      tw.kill();
    };
  }, [active, tex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!active && !tex) onGone();
  }, [active, tex]); // eslint-disable-line react-hooks/exhaustive-deps

  const uniforms = useMemo(
    () => ({
      uTex: { value: null as THREE.Texture | null },
      uDark: { value: new THREE.Color(theme.duotone![0]) },
      uLight: { value: new THREE.Color(theme.duotone![1]) },
      uBg: { value: new THREE.Color(theme.colors.bg) },
      uMode: { value: img.treatment === 'mono' ? 1 : img.treatment === 'color' ? 2 : 0 },
      uFade: { value: 0 },
      uOpacity: { value: img.opacity ?? 0.55 },
      uCover: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
    }),
    [img.treatment, img.opacity],
  );

  const dist = CAM_Z + DEPTH;
  const visH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * 1.12;
  const visW = visH * (size.width / size.height);

  useFrame((state) => {
    const m = mat.current;
    if (!m || !tex) return;
    m.uniforms.uTex.value = tex;
    m.uniforms.uFade.value = fade.v;
    m.uniforms.uTime.value = state.clock.elapsedTime;
    const ti = tex.image as { width: number; height: number };
    const planeA = visW / visH;
    const texA = ti.width / ti.height;
    m.uniforms.uCover.value.set(planeA > texA ? 1 : planeA / texA, planeA > texA ? texA / planeA : 1);
  });

  if (!tex) return null;
  return (
    <mesh position={[0, 0, -DEPTH]} renderOrder={-10}>
      <planeGeometry args={[visW, visH]} />
      <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} fog={false} />
    </mesh>
  );
}

/** Cross-fades duotone photo backdrops between slides (slide.image). Fails silently to the plain background. */
export function BackdropDirector() {
  const index = useDeck((s) => s.index);
  const img = slides[index].image;
  const [list, setList] = useState<{ img: BackdropImage; active: boolean }[]>(() => (img ? [{ img, active: true }] : []));

  useEffect(() => {
    setList((l) => {
      const next = l.map((x) => ({ ...x, active: !!img && x.img.src === img.src }));
      if (img && !next.some((x) => x.img.src === img.src)) next.push({ img, active: true });
      return next;
    });
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {list.map((x) => (
        <BackdropPlane
          key={x.img.src}
          img={x.img}
          active={x.active}
          onGone={() => setList((l) => l.filter((y) => y.img.src !== x.img.src || y.active))}
        />
      ))}
    </>
  );
}
