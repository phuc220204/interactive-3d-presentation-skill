import { slides, sources } from '../content';
import { locale, t } from '../i18n';
import { kindTag, MEDIA_KINDS } from '../lib/credit';

const labels = { images: t('images') };
/** MIT attribution, added automatically when any slide uses a ThreeUI effect. */
const usesThreeUI = slides.some((s) => s.scene.name === 'threeui');
const THREEUI_CREDIT = `To, M. (2026). ThreeUI Community [${t('effects')} WebGL]. MIT License. https://github.com/MengTo/threeui`;

/** APA reference list (hanging indent, alphabetical). The only internally scrollable area of the deck. */
export function References() {
  const text = sources.filter((s) => !MEDIA_KINDS.has(s.kind)).sort((a, b) => a.apa.localeCompare(b.apa, locale));
  const images = [
    ...sources.filter((s) => MEDIA_KINDS.has(s.kind)).sort((a, b) => a.apa.localeCompare(b.apa, locale)),
    ...(usesThreeUI ? [{ id: 'threeui', apa: THREEUI_CREDIT, short: 'ThreeUI', license: 'MIT' }] : []),
  ];
  return (
    <div data-scrollable data-anim="fade" className="scroll-thin mt-10 min-h-0 flex-1 overflow-y-auto pr-6">
      <ol className="columns-2 gap-16">
        {text.map((s) => (
          <li key={s.id} className="mb-5 break-inside-avoid [overflow-wrap:anywhere] pl-8 -indent-8 text-[18px] leading-[1.55] text-ink/80">
            {s.apa}
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
                {s.apa} {kindTag(s as Parameters<typeof kindTag>[0]) && <em className="not-italic text-accent">{kindTag(s as Parameters<typeof kindTag>[0])}. </em>}
                {s.license && <span className="font-mono text-[13px] text-muted">[{s.license}]</span>}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
