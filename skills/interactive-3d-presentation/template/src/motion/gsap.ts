import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(SplitText, useGSAP);
// slides omit optional parts (lead, blocks, meta…): animating an absent target is normal, not a bug
gsap.config({ nullTargetWarn: false });

/** Cinematic easing presets — use these names everywhere for a consistent feel. */
export const EASE = {
  out: 'power3.out',
  expo: 'expo.out',
  in: 'power2.in',
  inOut: 'power3.inOut',
} as const;

/** Global rhythm: stagger between sibling items. */
export const STAGGER = 0.08;

export { gsap, SplitText, useGSAP };
