import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { theme } from '../../content';
import type { GlobeScene, LatLon, Tone } from '../../types';
import { toneHex } from '../../lib/tone';
import { angularDistance, facingRotation, landDots, latLonToVec3 } from '../geo';
import { atmosphereMaterial, dotsMaterial, flowTubeMaterial, randAttr } from '../materials';
import { Label } from '../fade';
import { gsap } from '../../motion/gsap';

const R = 1.75;
const VN: LatLon = [16, 106.5];
/** Vietnam's sovereignty over the Paracel and Spratly archipelagos — always labelled when the region is in view. */
export const VN_SOVEREIGNTY = [
  { at: [16.5, 112] as LatLon, label: 'Q.đ. Hoàng Sa (Việt Nam)' },
  { at: [10, 114.3] as LatLon, label: 'Q.đ. Trường Sa (Việt Nam)' },
];

function Arc({ from, to, color, delay }: { from: LatLon; to: LatLon; color: string; delay: number }) {
  const mat = useMemo(() => flowTubeMaterial(color, 0.22), [color]);
  const geo = useMemo(() => {
    const a = latLonToVec3(from, R);
    const b = latLonToVec3(to, R);
    const ang = a.angleTo(b);
    const mid = a.clone().add(b).normalize().multiplyScalar(R * (1 + 0.18 + ang * 0.22));
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    return new THREE.TubeGeometry(curve, 96, 0.009, 6, false);
  }, [from, to]);
  useEffect(() => {
    mat.uniforms.uReveal.value = 0;
    const tw = gsap.to(mat.uniforms.uReveal, { value: 1, duration: 1.6, delay: 0.5 + delay, ease: 'power2.inOut' });
    return () => {
      tw.kill();
    };
  }, [mat, geo, delay]);
  useFrame((s) => (mat.uniforms.uTime.value = s.clock.elapsedTime));
  return <mesh geometry={geo} material={mat} />;
}

function Marker({ at, label, color, small }: { at: LatLon; label?: string; color: string; small?: boolean }) {
  const p = useMemo(() => latLonToVec3(at, R * 1.003), [at]);
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), p.clone().normalize()), [p]);
  const ring = useRef<THREE.Mesh>(null);
  const holder = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const tmp = useMemo(() => ({ w: new THREE.Vector3(), c: new THREE.Vector3() }), []);
  const facing = () => {
    const h = holder.current;
    if (!h) return false;
    tmp.w.copy(p).applyMatrix4(h.matrixWorld);
    tmp.c.setFromMatrixPosition(h.matrixWorld);
    return tmp.w.clone().sub(tmp.c).dot(camera.position.clone().sub(tmp.w)) > 0.05;
  };
  const out = useMemo(() => p.clone().multiplyScalar(1.07), [p]);
  useFrame((s) => {
    if (!ring.current) return;
    const t = (s.clock.elapsedTime * 0.8 + at[0] * 0.01) % 1;
    ring.current.scale.setScalar(1 + t * 2.2);
    (ring.current.material as THREE.MeshBasicMaterial).userData.baseOpacity = (1 - t) * 0.8;
  });
  return (
    <group ref={holder}>
      <mesh position={p} quaternion={q}>
        <circleGeometry args={[small ? 0.012 : 0.028, 20]} />
        <meshBasicMaterial color={color} transparent toneMapped={false} />
      </mesh>
      {!small && (
        <mesh ref={ring} position={p} quaternion={q}>
          <ringGeometry args={[0.03, 0.036, 32]} />
          <meshBasicMaterial color={color} transparent toneMapped={false} />
        </mesh>
      )}
      {label && (
        <Label position={[out.x, out.y, out.z]} align="left" getVisible={facing} small={small} text={label} color={small ? undefined : color} />
      )}
    </group>
  );
}

/** Dotted-land globe + flowing trade/relationship arcs + labelled points. Rotates to `focus`. */
export function Globe({ spec }: { spec: GlobeScene; active: boolean }) {
  const st = spec.state;
  const spin = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const { size, viewport } = useThree();

  const dots = useMemo(() => {
    const pos = landDots(42000, R);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aRand', randAttr(pos.length / 3));
    return g;
  }, []);
  const dotMat = useMemo(() => dotsMaterial(theme.colors.ink, 3.4, 1, 0.95), []);
  const atmo = useMemo(() => atmosphereMaterial(theme.colors.cool, 5, 0.85), []);

  // route mode: numbered stops + sequential arcs; the globe turns to the active stop
  const route = st.route ?? [];
  const activeStop = Math.min(Math.max(st.active ?? 0, 0), Math.max(route.length - 1, 0));
  const focus = st.focus ?? route[activeStop]?.at;
  const arcs = [
    ...(st.arcs ?? []),
    ...route.slice(1).map((r, i) => ({ from: route[i].at, to: r.at, tone: (i < activeStop ? 'accent' : 'muted') as Tone })),
  ];
  const points = [
    ...(st.points ?? []),
    ...route.map((r, i) => ({ at: r.at, label: `${i + 1} · ${r.label ?? ''}`, tone: (i === activeStop ? 'alert' : i < activeStop ? 'accent' : 'ink') as Tone })),
  ];
  const target = useMemo(() => (focus ? facingRotation(focus) : null), [focus?.[0], focus?.[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  const showVN = st.vnSovereignty ?? (focus ? angularDistance(focus, VN) < THREE.MathUtils.degToRad(40) : false);

  useFrame((s, dt) => {
    dotMat.uniforms.uVH.value = size.height * viewport.dpr;
    const g = spin.current;
    const t = tilt.current;
    if (!g || !t) return;
    if (target && !st.spin) {
      // shortest path in y
      let dy = target.y - g.rotation.y;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      g.rotation.y += dy * (1 - Math.exp(-2.2 * dt));
      t.rotation.x = THREE.MathUtils.damp(t.rotation.x, target.x, 2.2, dt);
    } else {
      g.rotation.y += dt * 0.08;
      t.rotation.x = THREE.MathUtils.damp(t.rotation.x, 0.35, 1.5, dt);
    }
    void s;
  });

  return (
    <group rotation={[0, 0, -0.12]}>
      <group ref={tilt}>
        <group ref={spin}>
          {/* ocean: drawn first (renderOrder) and writes depth → hides far-side dots, never covers near ones */}
          <mesh renderOrder={-1}>
            <sphereGeometry args={[R * 0.99, 64, 64]} />
            <meshBasicMaterial color={theme.colors.bg2} transparent opacity={0.92} />
          </mesh>
          <points geometry={dots} material={dotMat} />
          {arcs.map((a, i) => (
            <Arc key={`${a.from}-${a.to}-${i}`} from={a.from} to={a.to} color={toneHex(a.tone, 'accent')} delay={i * 0.12} />
          ))}
          {points.map((p, i) => (
            <Marker key={`${p.at}-${i}`} at={p.at} label={p.label} color={toneHex(p.tone, 'alert')} />
          ))}
          {showVN && VN_SOVEREIGNTY.map((p) => <Marker key={p.label} at={p.at} label={p.label} color={theme.colors.muted} small />)}
        </group>
      </group>
      <mesh material={atmo} scale={1.09}>
        <sphereGeometry args={[R, 64, 64]} />
      </mesh>
      {/* orbit hairline */}
      <mesh rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[R * 1.32, 0.0025, 8, 256]} />
        <meshBasicMaterial color={theme.colors.ink} transparent opacity={0.18} />
      </mesh>
    </group>
  );
}
