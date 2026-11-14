import { useEffect, useRef, type RefObject } from 'react';
import type { Annotation, Slide } from '../types';
import { useBeat } from './beatContext';
import { gsap } from '../motion/gsap';
import { elbow, maskDraw, roughPath, wobbleEllipse, type Box } from '../motion/draw';
import { toneHex } from '../lib/tone';
import { reducedMotion } from '../lib/pointer';

const SVGNS = 'http://www.w3.org/2000/svg';
const SETTLE_MS = 1400; // wait for the enter choreography before measuring

/** Box of `el` (or a Range) in slide coordinates (1920 × 1080), whatever the stage scale. */
function toSlide(section: HTMLElement, r: DOMRect): Box {
  const s = section.getBoundingClientRect();
  const k = s.width / 1920 || 1;
  return { x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k };
}

/** Phrase on the slide (smallest element containing it; exact text range when it sits in one text node) or a CSS selector. */
function findTarget(section: HTMLElement, target: string): { box: Box; el: Element } | null {
  const skip = (n: Node) => (n as Element).closest?.('.annot-layer, .conn-layer, [aria-hidden="true"]');
  if (/^[#.[]/.test(target)) {
    const el = section.querySelector(target);
    return el ? { box: toSlide(section, el.getBoundingClientRect()), el } : null;
  }
  const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) {
    if (!n.parentElement || skip(n.parentElement)) continue;
    const i = n.data.indexOf(target);
    if (i >= 0) {
      const range = document.createRange();
      range.setStart(n, i);
      range.setEnd(n, i + target.length);
      return { box: toSlide(section, range.getBoundingClientRect()), el: n.parentElement };
    }
  }
  const lower = target.toLowerCase();
  let best: Element | null = null;
  for (const el of section.querySelectorAll('*')) {
    if (skip(el) || !(el.textContent ?? '').toLowerCase().includes(lower)) continue;
    if (!best || best.contains(el)) best = el;
  }
  return best ? { box: toSlide(section, best.getBoundingClientRect()), el: best } : null;
}

function addPath(svg: SVGSVGElement, d: string, color: string, width = 3.2) {
  const p = document.createElementNS(SVGNS, 'path');
  p.setAttribute('d', d);
  p.setAttribute('fill', 'none');
  p.setAttribute('stroke', color);
  p.setAttribute('stroke-width', String(width));
  p.setAttribute('stroke-linecap', 'round');
  p.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(p);
  return p;
}

function drawAnnotation(svg: SVGSVGElement, a: Annotation, box: Box, seed: number, delay: number) {
  const color = toneHex(a.tone ?? 'alert');
  const pad = 10;
  const tweens: (gsap.core.Tween | null)[] = [];
  let d = '';
  if (a.type === 'circle') d = wobbleEllipse(box.x + box.w / 2, box.y + box.h / 2, box.w / 2 + pad * 2.2, box.h / 2 + pad * 1.4, seed);
  else if (a.type === 'underline') d = roughPath([[box.x - 4, box.y + box.h + 6], [box.x + box.w + 6, box.y + box.h + 3]], seed);
  else if (a.type === 'box')
    d = roughPath([[box.x - pad, box.y - pad], [box.x + box.w + pad, box.y - pad], [box.x + box.w + pad, box.y + box.h + pad], [box.x - pad, box.y + box.h + pad], [box.x - pad + 6, box.y - pad - 4]], seed);
  let tail: [number, number] | null = null;
  if (a.type === 'arrow') {
    const right = box.x + box.w + 260 < 1880;
    const tx = right ? box.x + box.w + 190 : box.x - 190;
    const ty = Math.max(70, box.y - 70);
    const hx = right ? box.x + box.w + 12 : box.x - 12;
    const hy = box.y + box.h / 2;
    const cx = (tx + hx) / 2;
    d = `M${tx} ${ty} Q${cx} ${ty - 20} ${hx} ${hy}`;
    const ang = Math.atan2(hy - (ty - 20), hx - cx);
    const h1 = [hx - 18 * Math.cos(ang - 0.45), hy - 18 * Math.sin(ang - 0.45)];
    const h2 = [hx - 18 * Math.cos(ang + 0.45), hy - 18 * Math.sin(ang + 0.45)];
    const head = addPath(svg, `M${h1[0]} ${h1[1]} L${hx} ${hy} L${h2[0]} ${h2[1]}`, color);
    tweens.push(maskDraw(head, { delay: delay + 0.75, duration: 0.25, cover: 20 }));
    tail = [tx, ty];
  }
  const p = addPath(svg, d, color);
  tweens.unshift(maskDraw(p, { delay, duration: a.type === 'circle' ? 0.9 : 0.7, pen: true, cover: 22 }));
  if (a.note) {
    const t = document.createElementNS(SVGNS, 'text');
    const [nx, ny] = tail ?? [box.x + box.w + 26, box.y - 14];
    t.setAttribute('x', String(nx));
    t.setAttribute('y', String(ny - 10));
    t.setAttribute('fill', color);
    t.setAttribute('class', 'annot-note');
    t.setAttribute('text-anchor', tail && nx < box.x ? 'end' : 'middle');
    t.textContent = a.note;
    svg.appendChild(t);
    if (!reducedMotion()) tweens.push(gsap.from(t, { opacity: 0, y: 8, duration: 0.5, delay: delay + 0.6 }));
  }
  return tweens;
}

/**
 * Pen annotations (slide.annotations) and block connectors (slide.connectors), drawn in an SVG over the slide.
 * Measured from the DOM after the enter motion, re-drawn when the beat changes.
 */
export function Overlays({ slide, sectionRef }: { slide: Slide; sectionRef: RefObject<HTMLElement | null> }) {
  const beat = useBeat();
  const svgRef = useRef<SVGSVGElement>(null);
  const first = useRef(true);

  useEffect(() => {
    const section = sectionRef.current;
    const svg = svgRef.current;
    if (!section || !svg) return;
    const anns = (slide.annotations ?? []).filter((a) => beat >= (a.beat ?? 0));
    const conns = (slide.connectors ?? []).filter((c) => beat >= (c.beat ?? 0));
    if (!anns.length && !conns.length) {
      svg.replaceChildren();
      return;
    }
    const live: (gsap.core.Tween | gsap.core.Timeline | null)[] = [];
    const dimmed: Element[] = [];
    const timer = window.setTimeout(
      () => {
        svg.replaceChildren();
        // connectors
        conns.forEach((c, i) => {
          const A = section.querySelector(`[data-node="${c.from}"]`);
          const B = section.querySelector(`[data-node="${c.to}"]`);
          if (!A || !B) return console.warn('[deck] connector: block id not found', c);
          const p = addPath(svg, elbow(toSlide(section, A.getBoundingClientRect()), toSlide(section, B.getBoundingClientRect())), c.accent ? toneHex('accent') : toneHex('ink'), c.accent ? 2.4 : 1.6);
          p.setAttribute('opacity', c.accent ? '1' : '0.55');
          const tw = maskDraw(p, { delay: i * 0.15, duration: 0.8, cover: 18 });
          live.push(tw);
          if (c.accent && !reducedMotion()) {
            const flow = () => p.classList.add('conn-flow');
            if (tw) tw.eventCallback('onComplete', flow);
            else flow();
            const len = p.getTotalLength();
            for (let k = 0; k < 2; k++) {
              const dot = document.createElementNS(SVGNS, 'circle');
              dot.setAttribute('r', '5');
              dot.setAttribute('fill', toneHex('accent'));
              svg.appendChild(dot);
              const z = { f: 0 };
              live.push(
                gsap.to(z, {
                  f: 1,
                  duration: 2.2,
                  delay: 1 + k * 1.1,
                  repeat: -1,
                  ease: 'none',
                  onUpdate: () => {
                    const pt = p.getPointAtLength(len * z.f);
                    dot.setAttribute('cx', String(pt.x));
                    dot.setAttribute('cy', String(pt.y));
                  },
                }),
              );
            }
          }
        });
        // pen annotations
        anns.forEach((a, i) => {
          const hit = findTarget(section, a.target);
          if (!hit) return console.warn('[deck] annotation target not found on slide:', a.target);
          const isNew = (a.beat ?? 0) === beat;
          live.push(...drawAnnotation(svg, a, hit.box, i + 1, isNew || first.current ? 0.1 + i * 0.2 : 0));
          if (a.dim)
            section.querySelectorAll('[data-anim]').forEach((el) => {
              if (el.contains(hit.el) || hit.el.contains(el)) return;
              dimmed.push(el);
              live.push(gsap.to(el, { opacity: 0.22, duration: 0.5 }));
            });
        });
        first.current = false;
      },
      first.current ? SETTLE_MS : 250,
    );
    return () => {
      window.clearTimeout(timer);
      live.forEach((t) => t?.kill());
      if (dimmed.length) gsap.to(dimmed, { opacity: 1, duration: 0.3 });
    };
  }, [beat, slide, sectionRef]);

  if (!slide.annotations?.length && !slide.connectors?.length) return null;
  return <svg ref={svgRef} className="annot-layer" viewBox="0 0 1920 1080" preserveAspectRatio="none" aria-hidden="true" />;
}
