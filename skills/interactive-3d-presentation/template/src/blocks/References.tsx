import { useRef, type ReactElement } from 'react';
import { slides, sources } from '../content';
import { lang, locale, t } from '../i18n';
import { kindTag, MEDIA_KINDS } from '../lib/credit';
import { gsap, useGSAP } from '../motion/gsap';
import { reducedMotion } from '../lib/pointer';
import type { Source } from '../types';

const labels = { images: t('images') };
/** MIT attribution, added automatically when any slide uses a ThreeUI effect. */
const usesThreeUI = slides.some((s) => s.scene.name === 'threeui');
const THREEUI_CREDIT = `To, M. (2026). ThreeUI Community [${t('effects')} WebGL]. MIT License. https://github.com/MengTo/threeui`;

type Kind = NonNullable<Source['kind']>;
/** Which icon / summary group each source kind belongs to. */
const GROUP: Record<Kind, string> = {
  text: 'text', data: 'data', photo: 'photo', image: 'photo', user: 'user', ai: 'ai', diagram: 'diagram',
  video: 'video', model: 'model', lottie: 'motion', spline: 'model', effect: 'effect',
};
const NAMES: Record<string, [string, string]> = {
  text: ['văn bản', 'texts'], data: ['dữ liệu', 'datasets'], photo: ['ảnh', 'photos'], user: ['ảnh tác giả', "author's images"],
  ai: ['minh hoạ AI', 'AI illustrations'], diagram: ['sơ đồ', 'diagrams'], video: ['video', 'videos'], model: ['mô hình 3D', '3D models'],
  motion: ['hoạt hình', 'animations'], effect: ['hiệu ứng', 'effects'],
};
/** 16×16 stroke icons (currentColor). */
const ICON: Record<string, ReactElement> = {
  text: <path d="M4 2h6l3 3v9H4zM10 2v3h3M6 8h5M6 11h5" />,
  data: <path d="M2 14h12M4 12V8M8 12V4M12 12V6" />,
  photo: <path d="M2 4h12v9H2zM2 11l4-4 3 3 2-2 3 3M10.5 6.5h.01" />,
  user: <path d="M8 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 14c.5-3 2.5-4.5 5-4.5s4.5 1.5 5 4.5" />,
  ai: <path d="M8 2l1.4 3.6L13 7l-3.6 1.4L8 12l-1.4-3.6L3 7l3.6-1.4zM12.5 11.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" />,
  diagram: <path d="M2 3h4v3H2zM10 10h4v3h-4zM4 6v5.5h6" />,
  video: <path d="M2 4h9v8H2zM11 7l3-2v6l-3-2" />,
  model: <path d="M8 2l5.5 3v6L8 14l-5.5-3V5zM8 8l5.5-3M8 8v6M8 8L2.5 5" />,
  motion: <path d="M2 10c2-6 4-6 6 0s4 6 6 0" />,
  effect: <path d="M8 1.5v3M8 11.5v3M1.5 8h3M11.5 8h3M3.4 3.4l2.1 2.1M10.5 10.5l2.1 2.1M3.4 12.6l2.1-2.1M10.5 5.5l2.1-2.1" />,
};
const groupOf = (s: { kind?: Source['kind'] }) => GROUP[(s.kind ?? 'text') as Kind] ?? 'text';
const Icon = ({ g }: { g: string }) => (
  <svg viewBox="0 0 16 16" className="ref-icon" aria-hidden="true">
    {ICON[g]}
  </svg>
);

/** APA reference list (hanging indent, alphabetical) with a type icon per entry and a summary by type. */
export function References() {
  const ref = useRef<HTMLDivElement>(null);
  const text = sources.filter((s) => !MEDIA_KINDS.has(s.kind)).sort((a, b) => a.apa.localeCompare(b.apa, locale));
  const images: (Source | { id: string; apa: string; short: string; license: string; kind: Kind })[] = [
    ...sources.filter((s) => MEDIA_KINDS.has(s.kind)).sort((a, b) => a.apa.localeCompare(b.apa, locale)),
    ...(usesThreeUI ? [{ id: 'threeui', apa: THREEUI_CREDIT, short: 'ThreeUI', license: 'MIT', kind: 'effect' as Kind }] : []),
  ];
  const counts = new Map<string, number>();
  for (const s of [...text, ...images]) counts.set(groupOf(s), (counts.get(groupOf(s)) ?? 0) + 1);
  const li = lang === 'vi' ? 0 : 1;

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from(ref.current!.querySelectorAll('.ref-stat'), { opacity: 0, y: 10, scale: 0.9, duration: 0.45, stagger: 0.08, delay: 0.5, ease: 'back.out(2)' });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} data-scrollable data-anim="fade" className="scroll-thin mt-8 min-h-0 flex-1 overflow-y-auto pr-6">
      <div className="mb-7 flex flex-wrap gap-x-7 gap-y-2 font-mono text-[15px] text-muted">
        {[...counts].map(([g, n]) => (
          <span key={g} className="ref-stat flex items-center gap-2">
            <Icon g={g} />
            <b className="text-ink">{n}</b> {NAMES[g][li]}
          </span>
        ))}
      </div>
      <ol className="columns-2 gap-16">
        {text.map((s) => (
          <li key={s.id} className="mb-5 break-inside-avoid [overflow-wrap:anywhere] pl-8 -indent-8 text-[18px] leading-[1.55] text-ink/80">
            <Icon g={groupOf(s)} />
            {s.apa}
            {s.status === 'secondary' && <em className="not-italic text-muted"> [{t('secondary')}]</em>}
            {s.url && !s.apa.includes(s.url) && (
              <a href={s.url} target="_blank" rel="noreferrer" className="ml-1 break-all text-cool/80 hover:text-cool">
                {s.url}
              </a>
            )}
          </li>
        ))}
      </ol>
      {images.length > 0 && (
        <>
          <div className="eyebrow mt-8 mb-4 text-[14px] text-accent">{labels.images}</div>
          <ol className="columns-2 gap-16">
            {images.map((s) => (
              <li key={s.id} className="mb-3 break-inside-avoid [overflow-wrap:anywhere] pl-8 -indent-8 text-[16px] leading-[1.5] text-ink/65">
                <Icon g={groupOf(s)} />
                {s.apa} {kindTag(s as Source) && <em className="not-italic text-accent">{kindTag(s as Source)}. </em>}
                {s.license && <span className="font-mono text-[13px] text-muted">[{s.license}]</span>}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
