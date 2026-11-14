import { useEffect, useState } from 'react';

type Katex = typeof import('katex');
let katexPromise: Promise<Katex> | null = null;
/** KaTeX (+ its CSS/fonts) is loaded only when a deck actually shows math. */
function loadKatex() {
  if (!katexPromise) {
    katexPromise = Promise.all([import('katex'), import('katex/dist/katex.min.css')]).then(([m]) => (m.default ?? m) as Katex);
  }
  return katexPromise;
}

/** Render TeX with KaTeX. `display` = block formula; otherwise inline. Errors render as the raw TeX in alert colour. */
export function TeX({ tex, display = false }: { tex: string; display?: boolean }) {
  const [html, setHtml] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    loadKatex().then((k) => {
      if (!alive) return;
      setHtml(k.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore', output: 'html' }));
    });
    return () => {
      alive = false;
    };
  }, [tex, display]);
  if (html === null) return <span className="font-mono opacity-60">{tex}</span>;
  return <span className={display ? 'block' : 'inline-block'} dangerouslySetInnerHTML={{ __html: html }} />;
}
