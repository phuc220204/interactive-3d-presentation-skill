import * as THREE from 'three';
import { LAND_B64, LAND_H, LAND_W } from './landmask';
import type { LatLon } from '../types';

let mask: Uint8Array | null = null;
function getMask() {
  if (!mask) {
    const bin = atob(LAND_B64);
    mask = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) mask[i] = bin.charCodeAt(i);
  }
  return mask;
}

export function isLand(lat: number, lon: number) {
  const m = getMask();
  const y = Math.min(LAND_H - 1, Math.max(0, Math.floor(((90 - lat) / 180) * LAND_H)));
  const x = Math.min(LAND_W - 1, Math.max(0, Math.floor(((lon + 180) / 360) * LAND_W)));
  const i = y * LAND_W + x;
  return (m[i >> 3] & (1 << (i & 7))) !== 0;
}

/** lat/lon (deg) → point on sphere of radius r. Convention: lon 0 faces +z when rotation is 0. */
export function latLonToVec3([lat, lon]: LatLon, r = 1, out = new THREE.Vector3()) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return out.set(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

/** Rotation (x, y) that brings `at` to face the camera (+z). */
export function facingRotation(at: LatLon) {
  const v = latLonToVec3(at, 1);
  const ry = Math.atan2(-v.x, v.z);
  const zAfter = -v.x * Math.sin(ry) + v.z * Math.cos(ry);
  const rx = Math.atan2(v.y, zAfter);
  return { x: rx, y: ry };
}

/** Evenly distributed dots on land (Fibonacci sphere sampling). */
export function landDots(count: number, r: number) {
  const out: number[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = golden * i;
    const x = Math.cos(th) * rad;
    const z = Math.sin(th) * rad;
    const lat = THREE.MathUtils.radToDeg(Math.asin(y));
    // invert latLonToVec3 to get lon
    const theta = Math.atan2(z, -x);
    let lon = THREE.MathUtils.radToDeg(theta) - 180;
    if (lon < -180) lon += 360;
    if (isLand(lat, lon)) out.push(x * r, y * r, z * r);
  }
  return new Float32Array(out);
}

export function angularDistance(a: LatLon, b: LatLon) {
  return latLonToVec3(a).angleTo(latLonToVec3(b));
}
