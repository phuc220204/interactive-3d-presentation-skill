import { Fragment, useRef, type ReactNode } from 'react';
import type { Rich } from '../types';
import { TeX } from './math';
import { useDeck } from '../deck/store';
import { lang } from '../i18n';
import { formatLike, parseFormatted } from '../motion/draw';
import { EASE, gsap, useGSAP } from '../motion/gsap';
import { reducedMotion } from './pointer';

/** "1.220", "4,53%", "−48,34", "60–80 năm", "2,2 triệu" — a number (or range) with at most a short unit. */
const NUMERIC = /^[^\d\s]{0,2}[−-]?\d[\d.,]*(\s*[–-]\s*\d[\d.,]*)?\s*(%|‰|°C|x|lần|tỷ|triệu|nghìn|năm|tuổi|km|kg|USD|đ|\$|k|M|B|bn|m|years?|people|times)?$/;

/** ==number== counts up from 0 when the slide enters, keeping the author's exact format. */
function CountText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const el = ref.current;
    const f = parseFormatted(text, lang === 'vi' ? 'vi' : 'en');
    if (!el || !f || reducedMotion()) return;
    const z = { k: 0 };
    gsap.to(z, { k: 1, duration: 1.3, delay: 0.5, ease: EASE.out, onUpdate: () => (el.textContent = formatLike(f, z.k)), onComplete: () => (el.textContent = text) });
  }, []);
  return <span ref={ref}>{text}</span>;
}

const TOKEN = /(\[[^\]]+\]\(\^[\w.-]+\)|\$\$[^$]+?\$\$|\*\*[^*]+?\*\*|!![^!]+?!!|==[^=]+?==|\*[^*\s][^*]*?\*|\n)/g;
const CITE = /^\[([^\]]+)\]\(\^([\w.-]+)\)$/;
const TOKEN_ONLY = new RegExp(`^${TOKEN.source}$`);

/** Clickable cited fragment: dotted underline, opens the source drawer; K highlights all of them. */
export function Cite({ id, children }: { id: string; children: ReactNode }) {
  const open = useDeck((s) => s.openSource);
  return (
    <button
      type="button"
      data-c={id}
      className="cite"
      onClick={(e) => {
        e.stopPropagation();
        const r = e.currentTarget.getBoundingClientRect();
        open(id, { x: r.left, y: r.top, w: r.width, h: r.height });
      }}
    >
      {children}
    </button>
  );
}

/**
 * Render inline markup:
 *   **accent**  !!alert!!  ==data==  *italic*  $$x^2$$ (inline math)  [text](^sourceId) (citation)  \n
 * Styling comes from the theme skin (index.css .rich-*): coloured text on editorial,
 * highlighter strokes on sketch, chalk underlines on chalk…
 */
export function R({ text, className }: { text?: Rich; className?: string }) {
  if (!text) return null;
  const parts = text.split(TOKEN).filter((p) => p !== '');
  const out: ReactNode[] = parts.map((p, i) => {
    if (p === '\n') return <br key={i} />;
    const c = p.match(CITE);
    if (c) return <Cite key={i} id={c[2]}><R text={c[1]} /></Cite>;
    if (p.startsWith('$$') && p.endsWith('$$') && p.length > 4) return <TeX key={i} tex={p.slice(2, -2)} />;
    if (p.startsWith('**')) return <strong key={i} className="rich-accent">{p.slice(2, -2)}</strong>;
    if (p.startsWith('!!')) return <strong key={i} className="rich-alert">{p.slice(2, -2)}</strong>;
    if (p.startsWith('==')) {
      const v = p.slice(2, -2);
      return <span key={i} className="rich-data">{NUMERIC.test(v.trim()) ? <CountText text={v} /> : v}</span>;
    }
    if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
    return <Fragment key={i}>{p}</Fragment>;
  });
  // keep punctuation glued to the marked-up word before it ("**6 năm**, …"): line splitting (SplitText) would
  // otherwise allow a break before the comma and start the next line with it
  for (let i = 1; i < parts.length; i++) {
    const m = parts[i].match(/^([,.;:!?…)\]”»]+)([\s\S]*)$/);
    if (!m || parts[i - 1] === '\n' || !TOKEN_ONLY.test(parts[i - 1])) continue;
    out[i - 1] = (
      <span key={`g${i}`} className="whitespace-nowrap">
        {out[i - 1]}
        {m[1]}
      </span>
    );
    out[i] = <Fragment key={i}>{m[2]}</Fragment>;
  }
  return className ? <span className={className}>{out}</span> : <>{out}</>;
}

/** Strip markup → plain string (overview, tooltips, notes, word counts). */
export const plain = (text?: Rich) =>
  (text ?? '')
    .replace(/\[([^\]]+)\]\(\^[\w.-]+\)/g, '$1')
    .replace(/\$\$/g, '')
    .replace(/\*\*|!!|==/g, '')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\n/g, ' ');

/** Every source id cited inline anywhere in a value (slide, block…). */
export function citedIds(v: unknown): string[] {
  const s = JSON.stringify(v);
  const ids = [...s.matchAll(/\]\(\^([\w.-]+)\)/g)].map((m) => m[1]);
  const fields = [...s.matchAll(/"source":"([\w.-]+)"/g)].map((m) => m[1]);
  return [...new Set([...ids, ...fields])];
}
