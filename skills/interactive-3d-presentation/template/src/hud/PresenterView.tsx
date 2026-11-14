import { useEffect, useState } from 'react';
import { deck, notes, slides } from '../content';
import { channel } from '../deck/store';
import { beatCount } from '../deck/beats';
import { plain } from '../lib/rich';
import { t } from '../i18n';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Presenter window (P, or /?presenter). Mirrors the audience deck through BroadcastChannel:
 * notes, current beat, next slide, shared timer (T). Keys / clicks here drive the main deck (beats first).
 */
export function PresenterView() {
  const [index, setIndex] = useState(() => Math.max(0, parseInt(location.hash.slice(1) || '1', 10) - 1));
  const [beat, setBeat] = useState(0);
  const [clock, setClock] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type: string; index?: number; beat?: number; clock?: number | null };
      if (d.type === 'state') {
        if (typeof d.index === 'number') setIndex(d.index);
        setBeat(d.beat ?? 0);
        setClock(d.clock ?? null);
      }
    };
    channel?.addEventListener('message', onMsg);
    channel?.postMessage({ type: 'hello' });
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    const send = (type: string) => channel?.postMessage({ type });
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowRight', ' ', 'PageDown', 'ArrowDown'].includes(e.key)) (e.preventDefault(), send('next'));
      if (['ArrowLeft', 'PageUp', 'ArrowUp'].includes(e.key)) (e.preventDefault(), send('prev'));
      if (e.key === 't' || e.key === 'T') send('clock');
    };
    window.addEventListener('keydown', onKey);
    return () => {
      channel?.removeEventListener('message', onMsg);
      window.clearInterval(id);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const s = slides[index];
  const nx = slides[index + 1];
  const total = beatCount(s);
  const el = clock ? Math.floor((now - clock) / 1000) : 0;
  const over = deck.targetMinutes && el > deck.targetMinutes * 60;
  return (
    <div className="grid h-full grid-cols-[1fr_400px] gap-8 overflow-hidden bg-bg p-10 text-ink">
      <div className="flex min-h-0 flex-col gap-5">
        <div className="flex items-center gap-4 font-mono text-[14px] tracking-[0.16em] text-muted uppercase">
          <span>
            {pad(index + 1)}/{pad(slides.length)} · {s.section}
          </span>
          {s.speaker && <span className="text-accent">{s.speaker}</span>}
          {s.minutes && (
            <span>
              {t('planned')} {Math.floor(s.minutes)}:{String(Math.round((s.minutes % 1) * 60)).padStart(2, '0')}
            </span>
          )}
          {total > 0 && (
            <span className="flex items-center gap-1.5">
              {t('beat')}
              {Array.from({ length: total + 1 }, (_, k) => (
                <i key={k} className={`inline-block h-2.5 w-2.5 rounded-full ${k <= beat ? 'bg-accent' : 'bg-ink/20'}`} />
              ))}
            </span>
          )}
        </div>
        <h1 className="font-display text-[40px] leading-tight">{plain(s.title)}</h1>
        <div data-scrollable className="scroll-thin min-h-0 flex-1 overflow-y-auto text-[24px] leading-[1.6] whitespace-pre-line text-ink/90">
          {notes[s.id] ?? <span className="text-muted italic">{t('noNotes')}.</span>}
        </div>
        <div className="flex gap-3">
          <button className="card px-5 py-3 font-mono text-[14px]" onClick={() => channel?.postMessage({ type: 'prev' })}>← </button>
          <button className="card flex-1 px-5 py-3 font-mono text-[14px] text-accent" onClick={() => channel?.postMessage({ type: 'next' })}>
            {beat < total ? `${t('beat')} ${beat + 1}/${total}` : t('next')} →
          </button>
        </div>
      </div>
      <div className="hairline flex flex-col gap-6 border-l pl-8">
        <button className={`text-left font-mono text-[64px] ${over ? 'text-alert' : 'text-accent'}`} onClick={() => channel?.postMessage({ type: 'clock' })} title="T">
          {pad(Math.floor(el / 60))}:{pad(el % 60)}
        </button>
        {deck.targetMinutes && <div className="-mt-4 font-mono text-[12px] text-muted">/ {deck.targetMinutes}:00</div>}
        <div className="font-mono text-[12px] tracking-[0.16em] text-muted uppercase">{t('next')}</div>
        <div className="font-display text-[26px] leading-tight text-ink/80">{nx ? plain(nx.title) : t('end')}</div>
        <div className="mt-auto font-mono text-[12px] text-muted">{t('presenterHint')} · T</div>
      </div>
    </div>
  );
}
