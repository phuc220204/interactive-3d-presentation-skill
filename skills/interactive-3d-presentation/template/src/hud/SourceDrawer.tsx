import { sources } from '../content';
import { useDeck } from '../deck/store';
import { t } from '../i18n';

const KIND_LABEL: Record<string, string> = {
  text: 'TEXT',
  data: 'DATA',
  photo: 'PHOTO',
  image: 'PHOTO',
  user: 'USER',
  ai: 'AI',
  diagram: 'DIAGRAM',
  video: 'VIDEO',
  model: '3D MODEL',
  lottie: 'LOTTIE',
  spline: 'SPLINE',
  effect: 'EFFECT',
};

/** Source drawer: opens when a cited fragment ([text](^id) or metric.source) is clicked. Esc closes. */
export function SourceDrawer() {
  const id = useDeck((s) => s.source);
  const close = useDeck((s) => s.openSource);
  const src = id ? sources.find((s) => s.id === id) : null;
  return (
    <aside
      className={`hairline fixed bottom-6 left-6 z-50 w-[min(560px,92vw)] border bg-bg/95 p-6 shadow-2xl backdrop-blur-xl transition-all duration-400 ${
        src ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
      aria-hidden={!src}
    >
      {src && (
        <>
          <div className="mb-3 flex items-center justify-between font-mono text-[12px] tracking-[0.16em] text-muted uppercase">
            <span>
              {t('source')} · <span className="text-accent">{KIND_LABEL[src.kind ?? 'text'] ?? src.kind}</span>
              {src.license && <span> · {src.license}</span>}
              {src.status === 'secondary' && <span> · {t('secondary')}</span>}
            </span>
            <button onClick={() => close(null)} className="hover:text-ink">
              {t('close')} · Esc
            </button>
          </div>
          <div className="font-display text-[24px] leading-tight text-ink">
            {src.short}
            {src.page && <span className="ml-3 font-mono text-[14px] text-muted">{src.page}</span>}
          </div>
          {src.use && <p className="mt-2 text-[15px] italic leading-snug text-muted">{src.use}</p>}
          <p className="mt-3 text-[16px] leading-relaxed text-ink/80 [overflow-wrap:anywhere]">{src.apa}</p>
          {src.url && (
            <a href={src.url} target="_blank" rel="noreferrer" className="mt-4 inline-block font-mono text-[13px] text-cool hover:underline">
              {t('openSource')} ↗
            </a>
          )}
        </>
      )}
    </aside>
  );
}
