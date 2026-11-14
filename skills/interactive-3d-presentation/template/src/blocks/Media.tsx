import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { GalleryBlock, MathBlock, VideoBlock } from '../types';
import { R } from '../lib/rich';
import { TeX } from '../lib/math';
import { t } from '../i18n';
import { asset } from '../lib/asset';
import { ImageFrame } from './ImageFrame';

export function MathFormula({ block }: { block: MathBlock }) {
  return (
    <figure data-anim="item" className="card flex flex-col items-center gap-3 px-8 py-7">
      <div className="text-[34px] leading-none text-ink">
        <TeX tex={block.tex} display />
      </div>
      {block.caption && <figcaption className="text-center text-[17px] leading-snug text-muted"><R text={block.caption} /></figcaption>}
    </figure>
  );
}

/** Image grid with in-stage lightbox (click → enlarge, click/Esc → close). */
export function Gallery({ block }: { block: GalleryBlock }) {
  const [open, setOpen] = useState<number | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  const cols = block.columns ?? Math.min(3, block.items.length);
  const cur = open !== null ? block.items[open] : null;
  return (
    <>
      <div ref={wrap} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
        {block.items.map((it, i) => (
          <button key={i} type="button" className="text-left transition-transform duration-300 hover:-translate-y-1" onClick={() => setOpen(i)}>
            <ImageFrame block={{ type: 'image', src: it.src, alt: it.alt, caption: it.caption, credit: it.credit, treatment: block.treatment ?? 'color', ratio: block.ratio ?? '4 / 3' }} />
          </button>
        ))}
      </div>
      {cur && wrap.current?.closest('[data-slide]') && createPortal(
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-bg/90 p-16 backdrop-blur-md" onClick={() => setOpen(null)}>
          <img src={asset(cur.src)} alt={cur.alt} referrerPolicy="no-referrer" className="max-h-[820px] max-w-[1600px] object-contain shadow-2xl" />
          <div className="text-center text-[20px] text-ink/85">
            {cur.caption ? <R text={cur.caption} /> : cur.alt}
            {cur.credit && <span className="ml-3 font-mono text-[13px] text-muted">{cur.credit}</span>}
          </div>
        </div>,
        wrap.current.closest('[data-slide]')!,
      )}
    </>
  );
}

/** Video: file → autoplay muted loop; YouTube → poster until clicked (no third-party request before that). */
export function Video({ block }: { block: VideoBlock }) {
  const [play, setPlay] = useState(false);
  const ratio = block.ratio ?? '16 / 9';
  return (
    <figure data-anim="item" className="flex flex-col gap-3">
      <div className="hairline relative overflow-hidden border bg-bg2" style={{ aspectRatio: ratio }}>
        {block.src ? (
          <video src={asset(block.src)} poster={block.poster && asset(block.poster)} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
        ) : block.youtube && play ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${block.youtube}?autoplay=1&rel=0`}
            title={typeof block.caption === 'string' ? block.caption : 'video'}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button type="button" className="group absolute inset-0" onClick={() => setPlay(true)} aria-label={t('play')}>
            <img
              src={asset(block.poster ?? `https://i.ytimg.com/vi/${block.youtube}/hqdefault.jpg`)}
              alt=""
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
            />
            <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-[30px] text-bg shadow-xl transition-transform group-hover:scale-110">
              ▶
            </span>
          </button>
        )}
      </div>
      {block.caption && <figcaption className="text-[17px] leading-snug text-muted"><R text={block.caption} /></figcaption>}
    </figure>
  );
}
