import type { Layout, Slide } from '../types';
import { citedIds, plain, R } from '../lib/rich';
import { sources as allSources, slides as allSlides } from '../content';
import { t } from '../i18n';
import { Blocks } from '../blocks/Blocks';
import { References } from '../blocks/References';
import { mediaIndex } from './media';
import { kindTag } from '../lib/credit';

/*
 * Swiss editorial grid on a 1920×1080 stage:
 *   margins 128px left/right · content top 150px · footer baseline 1024px
 *   12 columns × 112px, gutter 24px  → split text column = 6 cols = 808px (+ margin) ≈ 880px
 */

const pad = (n: number) => String(n).padStart(2, '0');

const labels = { scope: t('scope'), sources: t('sources') };

/** Auto-scale headline by length so long Vietnamese titles never overflow. */
function titleClass(layout: Layout, text: string) {
  const n = plain(text).length;
  if (layout === 'cover') return n > 48 ? 'text-[104px]' : n > 30 ? 'text-[124px]' : 'text-[148px]';
  if (layout === 'center') return n > 90 ? 'text-[60px]' : n > 50 ? 'text-[76px]' : 'text-[96px]';
  if (layout === 'grid' || layout === 'references') return n > 70 ? 'text-[52px]' : 'text-[66px]';
  if (layout === 'full') return n > 60 ? 'text-[60px]' : 'text-[80px]';
  if (layout === 'section') return n > 60 ? 'text-[72px]' : n > 36 ? 'text-[92px]' : 'text-[112px]';
  return n > 70 ? 'text-[56px]' : n > 42 ? 'text-[68px]' : 'text-[84px]';
}

function Kicker({ slide, index }: { slide: Slide; index: number }) {
  const raw = slide.kicker ?? `${pad(index + 1)} · ${slide.section}`;
  const m = raw.match(/^(\d{1,3})\s*[·|—–-]\s*(.*)$/);
  return (
    <div data-anim="kicker" className="eyebrow flex items-center gap-4 text-muted">
      {m ? (
        <>
          <span className="text-[28px] font-semibold tracking-normal text-alert">{m[1]}</span>
          <span className="h-px w-10 bg-current opacity-50" />
          <span>{m[2]}</span>
        </>
      ) : (
        <span>{raw}</span>
      )}
    </div>
  );
}

function Header({ slide, index, layout, align = 'left' }: { slide: Slide; index: number; layout: Layout; align?: 'left' | 'center' }) {
  return (
    <header className={`flex flex-col gap-6 ${align === 'center' ? 'items-center text-center' : ''}`}>
      <Kicker slide={slide} index={index} />
      <h1
        data-anim="title"
        className={`font-display font-bold leading-[1.02] tracking-[-0.01em] text-ink [text-wrap:balance] ${titleClass(layout, slide.title)}`}
      >
        <R text={slide.title} />
      </h1>
      {slide.subtitle && (
        <p data-anim="fade" className="font-display text-[34px] italic leading-snug text-ink/80">
          <R text={slide.subtitle} />
        </p>
      )}
      {slide.lead && (
        <p data-anim="fade" className="max-w-[860px] text-[25px] font-light leading-[1.55] text-ink/80 [text-wrap:pretty]">
          <R text={slide.lead} />
        </p>
      )}
    </header>
  );
}

/** GIỚI HẠN + NGUỒN, anchored to the footer baseline. */
function Footer({ slide, width }: { slide: Slide; width: number }) {
  // footer = declared sources + every inline citation used on the slide
  const ids = [...new Set([...(slide.sources ?? []), ...(slide.image?.sourceId ? [slide.image.sourceId] : []), ...citedIds(slide)])];
  const srcs = ids.map((id) => {
    const s = allSources.find((x) => x.id === id);
    if (!s) return `⚠${id}`;
    const tag = kindTag(s);
    return tag ? `${s.short} (${tag})` : s.short;
  });
  if (!slide.scope && !srcs.length) return null;
  return (
    <footer
      data-anim="fade"
      className="absolute bottom-[52px] left-[128px] flex flex-col gap-2 font-mono text-[15px] leading-relaxed text-muted"
      style={{ width }}
    >
      <div data-anim="line" className="hairline mb-2 border-t" />
      {slide.scope && (
        <p>
          <span className="mr-3 tracking-[0.14em] text-ink/70 uppercase">{labels.scope}</span>
          <R text={slide.scope} />
        </p>
      )}
      {srcs.length > 0 && (
        <p>
          <span className="mr-3 tracking-[0.14em] text-ink/70 uppercase">{labels.sources}</span>
          {srcs.join('; ')}
        </p>
      )}
    </footer>
  );
}

export function SlideLayout({ slide, index }: { slide: Slide; index: number }) {
  const layout: Layout = slide.layout ?? 'split';
  const hasFooter = !!(slide.scope || slide.sources?.length);
  const bottom = hasFooter ? 190 : 110; // reserved space above footer

  switch (layout) {
    case 'section':
      return <SectionOpener slide={slide} index={index} />;

    case 'cover':
      return (
        <div className="absolute inset-0">
          <div className="absolute left-[128px] top-[210px] flex w-[1060px] flex-col gap-8">
            <Header slide={slide} index={index} layout={layout} />
          </div>
          {slide.meta && (
            <div
              className="absolute bottom-[96px] left-[128px] grid w-[1100px] gap-10"
              style={{ gridTemplateColumns: `repeat(${Math.min(slide.meta.length, 4)}, minmax(0,1fr))` }}
            >
              {slide.meta.map((m, i) => (
                <div key={i} data-anim="item" className="hairline border-t pt-4">
                  <div className="eyebrow text-[14px] text-muted">{m.label}</div>
                  <div className="mt-2 text-[22px] font-semibold text-ink">{m.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case 'center':
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-[260px] text-center" style={{ paddingBottom: hasFooter ? 120 : 0 }}>
          <Header slide={slide} index={index} layout={layout} align="center" />
          {slide.blocks && (
            <div data-fit="blocks" className="mt-12 flex max-h-[520px] w-full flex-col items-center gap-8 overflow-hidden">
              <Blocks blocks={slide.blocks} />
            </div>
          )}
          <Footer slide={slide} width={1664} />
        </div>
      );

    case 'grid':
      return (
        <div className="absolute inset-0">
          <div className="absolute left-[128px] right-[128px] top-[140px] flex flex-col" style={{ bottom }}>
            <Header slide={slide} index={index} layout={layout} />
            <div data-fit="blocks" className="mt-10 flex min-h-0 flex-1 flex-col gap-8 overflow-hidden">
              <Blocks blocks={slide.blocks ?? []} wide />
            </div>
          </div>
          <Footer slide={slide} width={1664} />
        </div>
      );

    case 'full':
      return (
        <div className="absolute inset-0">
          <div className="absolute bottom-[150px] left-[128px] flex w-[980px] flex-col gap-8">
            <Header slide={slide} index={index} layout={layout} />
            {slide.blocks && (
              <div data-fit="blocks" className="flex max-h-[360px] flex-col gap-6 overflow-hidden">
                <Blocks blocks={slide.blocks} />
              </div>
            )}
          </div>
          <Footer slide={slide} width={1100} />
        </div>
      );

    case 'references':
      return (
        <div className="absolute inset-0">
          <div className="absolute left-[128px] right-[128px] top-[140px] bottom-[80px] flex flex-col">
            <Header slide={slide} index={index} layout={layout} />
            <References />
          </div>
        </div>
      );

    case 'split-right':
    case 'split':
    default: {
      const right = layout === 'split-right';
      // a visual block (image, chart, diagram…) on a slide without a 3D scene takes the visual half of the stage
      const mi = mediaIndex(slide);
      const media = mi >= 0 ? slide.blocks![mi] : null;
      const textBlocks = media ? slide.blocks!.filter((_, i) => i !== mi) : slide.blocks;
      return (
        <div className="absolute inset-0">
          <div
            className="absolute top-[140px] flex w-[860px] flex-col"
            style={{ bottom, left: right ? 932 : 128 }}
          >
            <Header slide={slide} index={index} layout={layout} />
            {!!textBlocks?.length && (
              <div data-fit="blocks" className="mt-10 flex min-h-0 flex-1 flex-col gap-7 overflow-hidden">
                <Blocks blocks={textBlocks} />
              </div>
            )}
          </div>
          {media && (
            <div
              data-fit="media"
              className="absolute top-[140px] flex w-[760px] flex-col justify-center overflow-hidden"
              style={{ bottom: 110, left: right ? 128 : 1032 }}
            >
              <Blocks blocks={[media]} />
            </div>
          )}
          <div style={right ? { position: 'absolute', inset: 0, left: 804 } : undefined}>
            <Footer slide={slide} width={860} />
          </div>
        </div>
      );
    }
  }
}

/** Part opener: huge outlined part number that draws itself, title, and who presents which slides of this part. */
function SectionOpener({ slide, index }: { slide: Slide; index: number }) {
  const part = allSlides.slice(0, index + 1).filter((s) => s.layout === 'section').length;
  const nextOpener = allSlides.findIndex((s, i) => i > index && (s.layout === 'section' || s.layout === 'references'));
  const end = nextOpener < 0 ? allSlides.length : nextOpener;
  const speakers: { name: string; from: number; to: number }[] = [];
  for (let i = index; i < end; i++) {
    const sp = allSlides[i].speaker;
    if (!sp) continue;
    const last = speakers[speakers.length - 1];
    if (last?.name === sp) last.to = i + 1;
    else speakers.push({ name: sp, from: i + 1, to: i + 1 });
  }
  return (
    <div className="absolute inset-0">
      <svg className="absolute right-[96px] top-[120px] h-[620px] w-[760px] overflow-visible" viewBox="0 0 760 620" aria-hidden="true">
        <text x="740" y="560" textAnchor="end" className="ghost-num section-num font-display" style={{ fontSize: 640, fontWeight: 700 }}>
          {pad(part)}
        </text>
      </svg>
      <div className="absolute left-[128px] top-[300px] flex w-[1080px] flex-col gap-8">
        <Header slide={slide} index={index} layout="section" />
        {speakers.length > 0 && (
          <div data-anim="fade" className="hairline mt-4 flex flex-wrap gap-x-12 gap-y-3 border-t pt-5 font-mono text-[18px] text-muted">
            {speakers.map((sp) => (
              <span key={sp.name + sp.from}>
                <span className="text-ink">{sp.name}</span> · slide {sp.from === sp.to ? sp.from : `${sp.from}–${sp.to}`}
              </span>
            ))}
          </div>
        )}
      </div>
      <Footer slide={slide} width={1100} />
    </div>
  );
}
