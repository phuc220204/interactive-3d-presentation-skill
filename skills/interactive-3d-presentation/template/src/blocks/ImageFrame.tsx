import { useState } from 'react';
import type { ImageBlock } from '../types';
import { R } from '../lib/rich';
import { asset } from '../lib/asset';
import { kindTag, sourceForAsset } from '../lib/credit';

/**
 * Editorial image frame: duotone (accent highlights over obsidian shadows), mono, or color.
 * If the network image fails, an on-palette SVG placeholder with the alt text is shown instead.
 */
export function ImageFrame({ block }: { block: ImageBlock }) {
  const [failed, setFailed] = useState(false);
  // photos keep their real colours unless the author explicitly asks for a duotone / mono treatment
  const t = block.treatment ?? 'color';
  // AI / author-provided images always carry their provenance label
  const credit = [block.credit, kindTag(sourceForAsset(block.src))].filter(Boolean).join(' · ');
  return (
    <figure data-anim="item" className="flex flex-col gap-3">
      <div className="hairline relative overflow-hidden border bg-bg2" style={{ aspectRatio: block.ratio ?? '16 / 10' }}>
        {!failed ? (
          <>
            <img
              src={asset(block.src)}
              alt={block.alt}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              loading="eager"
              onError={() => setFailed(true)}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                filter: t === 'color' ? 'none' : 'grayscale(1) contrast(1.15) brightness(0.9)',
                mixBlendMode: t === 'duotone' ? 'luminosity' : 'normal',
              }}
            />
            {t === 'duotone' && (
              <div className="pointer-events-none absolute inset-0 mix-blend-multiply" style={{ background: 'linear-gradient(135deg, var(--c-accent), color-mix(in srgb, var(--c-accent) 40%, var(--c-bg)))' }} />
            )}
            {t !== 'color' && (
              <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, color-mix(in srgb, var(--c-bg) 70%, transparent) 100%)' }} />
            )}
          </>
        ) : (
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-label={block.alt}>
            <defs>
              <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="14" stroke="var(--c-accent)" strokeOpacity="0.18" strokeWidth="2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hatch)" />
            <text x="50%" y="50%" textAnchor="middle" fill="var(--c-muted)" fontFamily="var(--f-mono)" fontSize="16">{block.alt}</text>
          </svg>
        )}
        {credit && <span className="absolute bottom-2 right-3 font-mono text-[12px] text-ink/60">{credit}</span>}
      </div>
      {block.caption && <figcaption className="text-[17px] leading-snug text-muted"><R text={block.caption} /></figcaption>}
    </figure>
  );
}
