import { useRef } from 'react';
import { Highlight, type PrismTheme } from 'prism-react-renderer';
import type { CodeBlock } from '../types';
import { R } from '../lib/rich';
import { EASE, gsap, useGSAP } from '../motion/gsap';
import { reducedMotion } from '../lib/pointer';

/** Token colours come from the active theme's CSS variables, so code matches every preset. */
const THEME: PrismTheme = {
  plain: { color: 'var(--c-ink)', backgroundColor: 'transparent' },
  styles: [
    { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: 'var(--c-muted)', fontStyle: 'italic' } },
    { types: ['keyword', 'builtin', 'important', 'atrule', 'selector'], style: { color: 'var(--c-accent)' } },
    { types: ['string', 'char', 'attr-value', 'regex', 'inserted'], style: { color: 'var(--c-cool)' } },
    { types: ['number', 'boolean', 'constant', 'symbol', 'deleted'], style: { color: 'var(--c-alert)' } },
    { types: ['function', 'class-name', 'tag'], style: { color: 'var(--c-ink)', fontWeight: '600' } },
    { types: ['punctuation', 'operator'], style: { color: 'color-mix(in srgb, var(--c-ink) 60%, transparent)' } },
    { types: ['property', 'attr-name', 'variable', 'parameter'], style: { color: 'color-mix(in srgb, var(--c-cool) 70%, var(--c-ink))' } },
  ],
};

/** Editor-window code block: syntax colours from the theme, emphasised lines, line-by-line reveal. */
export function Code({ block }: { block: CodeBlock }) {
  const ref = useRef<HTMLDivElement>(null);
  const hl = new Set(block.highlight ?? []);
  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from(gsap.utils.toArray('.code-line', ref.current), { opacity: 0, x: -10, duration: 0.4, stagger: 0.035, delay: 0.45, ease: EASE.out });
    },
    { scope: ref },
  );
  const lines = block.code.replace(/\n$/, '').split('\n').length;
  const size = lines > 16 ? 15 : lines > 11 ? 17 : 19;
  return (
    <figure ref={ref} data-anim="item" className="flex flex-col gap-3">
      <div className="card overflow-hidden">
        <div className="hairline flex items-center gap-2 border-b px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-alert/70" />
          <span className="h-3 w-3 rounded-full bg-accent/70" />
          <span className="h-3 w-3 rounded-full bg-cool/70" />
          <span className="ml-3 font-mono text-[13px] text-muted">{block.title ?? block.lang}</span>
        </div>
        <Highlight code={block.code.replace(/\n$/, '')} language={block.lang} theme={THEME}>
          {({ tokens, getLineProps, getTokenProps }) => (
            <pre className="overflow-hidden px-0 py-4 font-mono leading-[1.6]" style={{ fontSize: size }}>
              {tokens.map((line, i) => {
                const lp = getLineProps({ line });
                const on = hl.has(i + 1);
                return (
                  <div
                    key={i}
                    {...lp}
                    className={`code-line flex border-l-[3px] pr-5 ${on ? 'border-accent bg-accent/10' : 'border-transparent'} ${hl.size && !on ? 'opacity-55' : ''}`}
                  >
                    <span className="w-12 shrink-0 pr-4 text-right text-muted/60 select-none">{i + 1}</span>
                    <span className="whitespace-pre">
                      {line.map((token, k) => (
                        <span key={k} {...getTokenProps({ token })} />
                      ))}
                    </span>
                  </div>
                );
              })}
            </pre>
          )}
        </Highlight>
      </div>
      {block.caption && <figcaption className="text-[17px] leading-snug text-muted"><R text={block.caption} /></figcaption>}
    </figure>
  );
}
