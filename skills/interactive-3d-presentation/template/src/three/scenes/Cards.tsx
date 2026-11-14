import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { theme } from '../../content';
import type { CardsScene } from '../../types';
import { toneHex } from '../../lib/tone';
import { pointer } from '../../lib/pointer';
import { asset } from '../../lib/asset';
import { Label } from '../fade';
import { gsap } from '../../motion/gsap';

type Card = CardsScene['state']['cards'][number];
const CW = 1.15;
const CH = 1.55;

/** Procedural paper textures (no network): document, e-invoice, QR, chart, photo placeholder. */
function drawCard(card: Card, seed: number): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 460;
  c.height = 620;
  const g = c.getContext('2d')!;
  const paper = theme.colors.paper;
  const ink = theme.mode === 'light' ? theme.colors.ink : '#1b1c22';
  const acc = toneHex(card.tone, 'accent');
  let s = seed * 9301 + 49297;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  g.fillStyle = paper;
  g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = ink;
  g.lineWidth = theme.skin === 'sketch' ? 5 : 2;
  g.strokeRect(2, 2, c.width - 4, c.height - 4);
  g.fillStyle = acc;
  g.fillRect(0, 0, c.width, 10);
  g.fillStyle = ink;
  g.font = `600 22px ${theme.fonts.mono}`;
  const kind = card.kind ?? 'doc';
  const title = card.label ?? kind.toUpperCase();
  g.fillText(title.toUpperCase().slice(0, 26), 32, 62);
  g.fillStyle = 'rgba(27,28,34,.25)';
  g.fillRect(32, 80, 396, 2);

  if (kind === 'qr') {
    const n = 25, cell = 13, ox = 68, oy = 130;
    g.fillStyle = ink;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (r() > 0.52) g.fillRect(ox + x * cell, oy + y * cell, cell, cell);
    const finder = (fx: number, fy: number) => {
      g.fillStyle = paper; g.fillRect(ox + fx * cell - cell, oy + fy * cell - cell, cell * 9, cell * 9);
      g.fillStyle = ink; g.fillRect(ox + fx * cell, oy + fy * cell, cell * 7, cell * 7);
      g.fillStyle = paper; g.fillRect(ox + (fx + 1) * cell, oy + (fy + 1) * cell, cell * 5, cell * 5);
      g.fillStyle = ink; g.fillRect(ox + (fx + 2) * cell, oy + (fy + 2) * cell, cell * 3, cell * 3);
    };
    finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
    g.fillStyle = acc;
    g.font = `600 26px ${theme.fonts.mono}`;
    g.fillText('SCAN · PAY', 150, 520);
  } else if (kind === 'invoice') {
    g.font = `400 16px ${theme.fonts.mono}`;
    for (let i = 0; i < 9; i++) {
      const y = 130 + i * 38;
      g.fillStyle = 'rgba(27,28,34,.55)';
      g.fillRect(32, y, 150 + r() * 80, 8);
      g.fillRect(340 - r() * 30, y, 88, 8);
      g.fillStyle = 'rgba(27,28,34,.1)';
      g.fillRect(32, y + 20, 396, 1);
    }
    g.fillStyle = ink; g.fillRect(32, 488, 396, 2);
    g.fillStyle = acc; g.fillRect(270, 510, 158, 34);
    g.strokeStyle = acc; g.lineWidth = 3;
    g.beginPath(); g.arc(110, 545, 42, 0, Math.PI * 2); g.stroke();
  } else if (kind === 'chart') {
    for (let i = 0; i < 7; i++) {
      const h = 60 + r() * 280 * (0.4 + i / 10);
      g.fillStyle = i === 6 ? acc : 'rgba(27,28,34,.7)';
      g.fillRect(48 + i * 54, 520 - h, 36, h);
    }
    g.fillStyle = ink; g.fillRect(32, 522, 396, 2);
  } else if (kind === 'photo') {
    const grd = g.createLinearGradient(0, 110, 0, 560);
    grd.addColorStop(0, '#444650'); grd.addColorStop(1, '#16171c');
    g.fillStyle = grd; g.fillRect(32, 110, 396, 450);
  } else if (kind === 'note') {
    // sticky note: tinted paper, handwritten-ish lines
    g.fillStyle = acc; g.globalAlpha = 0.22; g.fillRect(0, 0, c.width, c.height); g.globalAlpha = 1;
    g.strokeStyle = ink; g.lineWidth = 3; g.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const y = 140 + i * 48; g.beginPath(); g.moveTo(40, y);
      for (let x = 40; x < 400 - r() * 120; x += 18) g.lineTo(x, y + Math.sin(x * 0.2 + i) * 3);
      g.stroke();
    }
  } else if (kind === 'code') {
    g.fillStyle = '#1b1d24'; g.fillRect(24, 100, 412, 470);
    const cols = [acc, '#7cc4d8', '#e0473c', '#d6d3cc', '#8e929f'];
    for (let i = 0; i < 16; i++) {
      let x = 44 + (i % 5 === 0 ? 0 : (i % 3) * 22);
      for (let k = 0; k < 3; k++) { const w = 30 + r() * 90; g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(x, 122 + i * 27, w, 9); x += w + 12; if (x > 400) break; }
    }
  } else if (kind === 'book') {
    g.fillStyle = acc; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 0, 34, c.height);
    g.fillStyle = paper; g.font = `700 40px ${theme.fonts.display}`;
    const words = (card.label ?? 'Book').split(' ');
    words.slice(0, 4).forEach((w, i) => g.fillText(w, 64, 200 + i * 52));
    g.fillRect(64, 440, 200, 3);
  } else if (kind === 'phone') {
    g.fillStyle = '#121319'; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = paper; g.fillRect(30, 60, 400, 520);
    g.fillStyle = acc; g.fillRect(30, 60, 400, 120);
    for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(27,28,34,.12)'; g.fillRect(50, 210 + i * 70, 360, 54); g.fillStyle = 'rgba(27,28,34,.55)'; g.fillRect(70, 228 + i * 70, 120 + r() * 150, 9); }
    g.fillStyle = '#121319'; g.fillRect(180, 22, 100, 14);
  } else if (kind === 'ticket') {
    // label "Hà Nội → Hội An" → big 3-letter codes on the stub
    const [from = 'A', to = 'B'] = (card.label ?? 'A → B').split(/→|->/).map((p) => p.trim().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'D').replace(/\s+/g, '').slice(0, 3).toUpperCase());
    g.fillStyle = ink; g.font = `700 64px ${theme.fonts.mono}`; g.fillText(from, 40, 220); g.fillText(to, 290, 220);
    g.fillStyle = acc; g.fillRect(180, 190, 90, 6);
    g.setLineDash([10, 10]); g.strokeStyle = ink; g.lineWidth = 2; g.beginPath(); g.moveTo(20, 330); g.lineTo(440, 330); g.stroke(); g.setLineDash([]);
    for (let i = 0; i < 40; i++) { g.fillStyle = ink; g.fillRect(60 + i * 9, 400, r() > 0.4 ? 5 : 2, 120); }
  } else if (kind === 'letter') {
    g.fillStyle = acc; g.globalAlpha = 0.12; g.fillRect(0, 0, c.width, c.height); g.globalAlpha = 1;
    g.strokeStyle = ink; g.lineWidth = 2;
    for (let i = 0; i < 12; i++) { const y = 140 + i * 34; g.beginPath(); g.moveTo(40, y); for (let x = 40; x < 420 - (i % 5 === 4 ? 160 : r() * 40); x += 10) g.lineTo(x, y + (r() - 0.5) * 3); g.stroke(); }
    g.fillStyle = '#b3261e'; g.beginPath(); g.arc(360, 545, 36, 0, Math.PI * 2); g.fill();
  } else if (kind === 'map') {
    g.fillStyle = acc; g.globalAlpha = 0.1; g.fillRect(24, 100, 412, 470); g.globalAlpha = 1;
    g.strokeStyle = 'rgba(27,28,34,.25)'; g.lineWidth = 1;
    for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(24, 120 + i * 52); g.bezierCurveTo(150, 90 + i * 52 + r() * 40, 300, 140 + i * 52 - r() * 40, 436, 120 + i * 52); g.stroke(); }
    g.setLineDash([12, 10]); g.strokeStyle = '#c8372d'; g.lineWidth = 4; g.beginPath(); g.moveTo(70, 520); g.bezierCurveTo(140, 300, 300, 460, 380, 170); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#c8372d'; g.beginPath(); g.arc(380, 170, 12, 0, Math.PI * 2); g.fill();
  } else {
    for (let i = 0; i < 13; i++) {
      g.fillStyle = 'rgba(27,28,34,.5)';
      g.fillRect(32, 125 + i * 30, i % 4 === 3 ? 180 + r() * 100 : 380 + r() * 16, 7);
    }
    g.strokeStyle = acc; g.lineWidth = 3;
    g.beginPath(); g.arc(360, 545, 38, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(360, 545, 28, 0, Math.PI * 2); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function FloatingCard({ card, i, n }: { card: Card; i: number; n: number }) {
  const g = useRef<THREE.Group>(null);
  const [tex, setTex] = useState<THREE.Texture>(() => drawCard(card, i + 1));
  useEffect(() => {
    if (!card.src) return;
    const l = new THREE.TextureLoader();
    l.setCrossOrigin('anonymous');
    l.load(asset(card.src), (t) => { t.colorSpace = THREE.SRGBColorSpace; setTex(t); }, undefined, () => console.warn('[deck] card image failed:', card.src));
  }, [card.src]);
  // fan layout
  const spread = Math.min(0.55, 1.6 / Math.max(1, n - 1));
  const a = (i - (n - 1) / 2) * spread;
  const base = useMemo(() => new THREE.Vector3(Math.sin(a) * 2.2, Math.cos(a * 1.4) * 0.25 - 0.1, Math.cos(a) * 0.9 - 0.9), [a]);
  useEffect(() => {
    if (!g.current) return;
    g.current.position.set(base.x, base.y - 1.2, base.z - 1);
    const tw = gsap.to(g.current.position, { x: base.x, y: base.y, z: base.z, duration: 1.4, delay: 0.25 + i * 0.1, ease: 'expo.out' });
    return () => {
      tw.kill();
    };
  }, [base, i]);
  useFrame((s, dt) => {
    const o = g.current;
    if (!o) return;
    const t = s.clock.elapsedTime;
    o.rotation.y = THREE.MathUtils.damp(o.rotation.y, -a * 0.9 + pointer.x * 0.25, 3, dt);
    o.rotation.x = THREE.MathUtils.damp(o.rotation.x, -pointer.y * 0.15 + Math.sin(t * 0.6 + i) * 0.04, 3, dt);
    o.rotation.z = Math.sin(t * 0.5 + i * 1.7) * 0.03 - a * 0.12;
    o.position.y += Math.sin(t * 0.9 + i) * 0.0009;
  });
  return (
    <group ref={g}>
      <mesh>
        <planeGeometry args={[CW, CH]} />
        <meshStandardMaterial map={tex} roughness={0.6} metalness={0} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.04, -0.05, -0.02]}>
        <planeGeometry args={[CW, CH]} />
        <meshBasicMaterial color={theme.mode === 'light' ? theme.colors.ink : '#000'} transparent opacity={theme.mode === 'light' ? 0.14 : 0.35} depthWrite={false} />
      </mesh>
      {card.label && (
        <Label position={[0, -CH / 2 - 0.2, 0]} text={card.label} />
      )}
    </group>
  );
}

/** Floating documents in space: invoices, QR codes, legal papers, charts or real photos (src). */
export function Cards({ spec }: { spec: CardsScene; active: boolean }) {
  const cards = spec.state.cards;
  const key = cards.map((c) => `${c.kind}${c.label}${c.src}`).join('|');
  return (
    <group key={key} rotation={[0.05, 0, 0]}>
      {cards.map((c, i) => (
        <FloatingCard key={i} card={c} i={i} n={cards.length} />
      ))}
    </group>
  );
}
