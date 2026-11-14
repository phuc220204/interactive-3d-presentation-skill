import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { theme } from '../../content';
import type { GlobeScene, LatLon, Tone } from '../../types';
import { toneHex } from '../../lib/tone';
import { angularDistance, facingRotation, landDots, latLonToVec3 } from '../geo';
import { atmosphereMaterial, dotsMaterial, flowTubeMaterial, randAttr } from '../materials';
import { Label } from '../fade';
import { gsap } from '../../motion/gsap';
import { fillPoints, findCountries, loadAtlas, type Atlas } from '../countries';

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
        <Label position={[out.x, out.y, out.z]} align="left" getVisible={facing} small={small} text={label} color={small ? undefined : color} avoid />
      )}
    </group>
  );
}

/** Polylines of [lon, lat] → line-segment positions on the sphere. */
function segments(lines: [number, number][][], r: number, close = false) {
  const out: number[] = [];
  const v = new THREE.Vector3();
  const w = new THREE.Vector3();
  for (const line of lines) {
    const n = line.length;
    for (let i = 0; i < (close ? n : n - 1); i++) {
      const a = line[i];
      const b = line[(i + 1) % n];
      if (Math.abs(a[0] - b[0]) > 180) continue; // antimeridian jump
      latLonToVec3([a[1], a[0]], r, v);
      latLonToVec3([b[1], b[0]], r, w);
      out.push(v.x, v.y, v.z, w.x, w.y, w.z);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(out), 3));
  return g;
}
function dotsGeo(pts: LatLon[], r: number) {
  const a = new Float32Array(pts.length * 3);
  const v = new THREE.Vector3();
  pts.forEach((p, i) => {
    latLonToVec3(p, r, v);
    a.set([v.x, v.y, v.z], i * 3);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(a, 3));
  g.setAttribute('aRand', randAttr(pts.length));
  return g;
}

/**
 * Dotted-land globe + flowing arcs + labelled points. Rotates to `focus`.
 * `highlight` paints the subject country in a strong colour with its outline, `borders` draws every border,
 * `regions` marks areas inside a country, `zoom` moves in. Ctrl + wheel zooms, Ctrl + drag turns the globe.
 */
export function Globe({ spec, active }: { spec: GlobeScene; active: boolean }) {
  const st = spec.state;
  const spin = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const zoomG = useRef<THREE.Group>(null);
  const { size, viewport } = useThree();
  const user = useRef({ zoom: 1, ry: 0, rx: 0 }).current;
  const tmpV = useMemo(() => new THREE.Vector3(), []);

  const dots = useMemo(() => {
    const pos = landDots(42000, R);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aRand', randAttr(pos.length / 3));
    return g;
  }, []);
  const dotMat = useMemo(() => dotsMaterial(theme.colors.ink, 3.4, 1, 0.95), []);
  const atmo = useMemo(() => atmosphereMaterial(theme.colors.cool, 5, 0.85), []);

  // country atlas (lazy)
  const hlKey = (st.highlight ?? []).join('|');
  const wantAtlas = !!hlKey || !!st.borders;
  const [atlas, setAtlas] = useState<Atlas | null>(null);
  useEffect(() => {
    if (!wantAtlas || atlas) return;
    let alive = true;
    loadAtlas()
      .then((a) => alive && setAtlas(a))
      .catch((e) => console.warn('[deck] globe: country atlas failed to load', e));
    return () => {
      alive = false;
    };
  }, [wantAtlas, atlas]);
  const hlColor = toneHex(st.tone, 'alert');
  const hl = useMemo(() => (atlas && hlKey ? findCountries(atlas, hlKey.split('|')) : []), [atlas, hlKey]);
  const showBorders = st.borders ?? !!hlKey;
  const borderGeo = useMemo(() => (atlas && showBorders ? segments(atlas.borders, R * 1.002) : null), [atlas, showBorders]);
  const hlGeo = useMemo(() => {
    if (!hl.length) return null;
    const rings = hl.flatMap((c) => c.rings);
    return { fill: dotsGeo(fillPoints(rings, 0.28), R * 1.004), line: segments(rings, R * 1.006, true) };
  }, [hl]);
  const hlMat = useMemo(() => dotsMaterial(hlColor, 3.6, 1, 1), [hlColor]);
  const regions = useMemo(
    () =>
      (st.regions ?? []).map((r) => {
        const ring = r.polygon.map(([lat, lon]) => [lon, lat] as [number, number]);
        const c = r.polygon.reduce((a, p) => [a[0] + p[0] / r.polygon.length, a[1] + p[1] / r.polygon.length], [0, 0]) as LatLon;
        const color = toneHex(r.tone, 'accent');
        return { name: r.name, color, center: c, fill: dotsGeo(fillPoints([ring], 0.12), R * 1.008), line: segments([ring], R * 1.01, true), mat: dotsMaterial(color, 2.6, 1, 1) };
      }),
    [JSON.stringify(st.regions ?? [])], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // route mode: numbered stops + sequential arcs; the globe turns to the active stop
  const route = st.route ?? [];
  const activeStop = Math.min(Math.max(st.active ?? 0, 0), Math.max(route.length - 1, 0));
  const focus = st.focus ?? route[activeStop]?.at ?? regions[0]?.center ?? hl[0]?.center;
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
  const vnHighlighted = hl.some((c) => c.id === '704');
  const baseZoom = st.zoom ?? 1;

  // presenter's own zoom / turn resets whenever the slide asks for a new view
  useEffect(() => {
    user.zoom = 1;
    user.ry = 0;
    user.rx = 0;
  }, [focus?.[0], focus?.[1], baseZoom, active]); // eslint-disable-line react-hooks/exhaustive-deps

  // Ctrl + wheel = zoom, Ctrl + drag = turn (plain wheel / click stay "next beat")
  useEffect(() => {
    if (!active) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      user.zoom = THREE.MathUtils.clamp(user.zoom * Math.exp(-e.deltaY * 0.0015), 0.8 / baseZoom, 6 / baseZoom);
    };
    let drag: { x: number; y: number } | null = null;
    const down = (e: PointerEvent) => {
      if (e.ctrlKey && e.button === 0) drag = { x: e.clientX, y: e.clientY };
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const k = 0.006 / (baseZoom * user.zoom);
      user.ry += (e.clientX - drag.x) * k;
      user.rx = THREE.MathUtils.clamp(user.rx + (e.clientY - drag.y) * k, -1, 1);
      drag = { x: e.clientX, y: e.clientY };
    };
    const up = () => (drag = null);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [active, baseZoom, user]);

  useFrame((_, dt) => {
    const vh = size.height * viewport.dpr;
    dotMat.uniforms.uVH.value = vh;
    hlMat.uniforms.uVH.value = vh;
    regions.forEach((r) => (r.mat.uniforms.uVH.value = vh));
    const g = spin.current;
    const t = tilt.current;
    const z = zoomG.current;
    if (!g || !t || !z) return;
    const sc = THREE.MathUtils.damp(z.scale.x, baseZoom * user.zoom, 3, dt);
    z.scale.setScalar(sc);
    // keep the focus where it was at zoom 1: shift by −(s−1)·p (p = focus in the zoom group's local space)
    if (focus) {
      latLonToVec3(focus, R, tmpV);
      g.localToWorld(tmpV);
      z.worldToLocal(tmpV);
      z.position.x = THREE.MathUtils.damp(z.position.x, -(sc - 1) * tmpV.x, 6, dt);
      z.position.y = THREE.MathUtils.damp(z.position.y, -(sc - 1) * tmpV.y, 6, dt);
      z.position.z = THREE.MathUtils.damp(z.position.z, -(sc - 1) * tmpV.z, 6, dt); // same depth → no perspective drift
    } else z.position.set(0, 0, 0);
    // dots grow with the model scale in the shader: soften it so a close-up stays a fine dotted map
    const k = 1 / Math.pow(Math.max(sc, 1), 0.75);
    dotMat.uniforms.uSize.value = 3.4 * k;
    hlMat.uniforms.uSize.value = 3.6 * k;
    regions.forEach((r) => (r.mat.uniforms.uSize.value = 2.6 * k));
    if (target && !st.spin) {
      // shortest path in y
      let dy = target.y + user.ry - g.rotation.y;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      g.rotation.y += dy * (1 - Math.exp(-2.2 * dt));
      t.rotation.x = THREE.MathUtils.damp(t.rotation.x, target.x + user.rx, 2.2, dt);
    } else {
      g.rotation.y += dt * 0.08;
      t.rotation.x = THREE.MathUtils.damp(t.rotation.x, 0.35, 1.5, dt);
    }
  });

  return (
    <group ref={zoomG}>
      <group rotation={[0, 0, -0.12]}>
        <group ref={tilt}>
          <group ref={spin}>
            {/* ocean: drawn first (renderOrder) and writes depth → hides far-side dots, never covers near ones */}
            <mesh renderOrder={-1}>
              <sphereGeometry args={[R * 0.99, 64, 64]} />
              <meshBasicMaterial color={theme.colors.bg2} transparent opacity={0.92} />
            </mesh>
            <points geometry={dots} material={dotMat} />
            {borderGeo && (
              <lineSegments geometry={borderGeo}>
                <lineBasicMaterial color={theme.colors.ink} transparent opacity={0.42} />
              </lineSegments>
            )}
            {hlGeo && (
              <>
                <points geometry={hlGeo.fill} material={hlMat} />
                <lineSegments geometry={hlGeo.line}>
                  <lineBasicMaterial color={hlColor} transparent opacity={1} toneMapped={false} />
                </lineSegments>
              </>
            )}
            {regions.map((r) => (
              <group key={r.name}>
                <points geometry={r.fill} material={r.mat} />
                <lineSegments geometry={r.line}>
                  <lineBasicMaterial color={r.color} transparent opacity={1} toneMapped={false} />
                </lineSegments>
                <Marker at={r.center} label={r.name} color={r.color} />
              </group>
            ))}
            {arcs.map((a, i) => (
              <Arc key={`${a.from}-${a.to}-${i}`} from={a.from} to={a.to} color={toneHex(a.tone, 'accent')} delay={i * 0.12} />
            ))}
            {points.map((p, i) => (
              <Marker key={`${p.at}-${i}`} at={p.at} label={p.label} color={toneHex(p.tone, 'alert')} />
            ))}
            {showVN && VN_SOVEREIGNTY.map((p) => <Marker key={p.label} at={p.at} label={p.label} color={vnHighlighted ? hlColor : theme.colors.muted} small />)}
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
    </group>
  );
}
