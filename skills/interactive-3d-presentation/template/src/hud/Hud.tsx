import { deck, slides, theme } from '../content';
import { useDeck } from '../deck/store';
import { plain } from '../lib/rich';
import { beatCount } from '../deck/beats';

const pad = (n: number) => String(n).padStart(2, '0');

/** In-stage HUD: brand (top-left), section + counter (top-right), dot navigator (right), progress (bottom). */
export function Hud() {
  const index = useDeck((s) => s.index);
  const beat = useDeck((s) => s.beat);
  const go = useDeck((s) => s.go);
  const toggle = useDeck((s) => s.toggle);
  const total = slides.length;
  const slide = slides[index];

  return (
    <div className="pointer-events-none absolute inset-0 z-30 font-mono">
      {/* top bar */}
      <div className="absolute left-[56px] right-[56px] top-[40px] flex items-center justify-between text-[15px] tracking-[0.14em] uppercase">
        <button className="pointer-events-auto flex items-center gap-3 text-ink/80 hover:text-ink" onClick={() => go(0)}>
          <span className="inline-block h-2 w-2 bg-alert" />
          {deck.brand}
        </button>
        <div className="flex items-center gap-6 text-muted">
          <span className="text-ink/80">
            {pad(index + 1)} — {slide.section}
          </span>
          {beatCount(slide) > 0 && (
            <span className="flex gap-1.5" aria-label={`beat ${beat}/${beatCount(slide)}`}>
              {Array.from({ length: beatCount(slide) + 1 }, (_, k) => (
                <i key={k} className={`inline-block h-[6px] w-[6px] rounded-full transition-colors ${k <= beat ? 'bg-accent' : 'bg-ink/25'}`} />
              ))}
            </span>
          )}
          <button className="pointer-events-auto hover:text-ink" onClick={() => toggle('overview')} title="Overview (O)">
            {pad(index + 1)}/{pad(total)}
          </button>
        </div>
      </div>

      {/* dot navigator */}
      <nav className="pointer-events-auto absolute right-[50px] top-1/2 flex -translate-y-1/2 flex-col items-end gap-[14px]">
        {slides.map((s, i) => (
          <button key={s.id} onClick={() => go(i)} className="group flex items-center gap-3" aria-label={`Slide ${i + 1}`}>
            <span className="translate-x-2 text-[13px] whitespace-nowrap text-ink/0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-ink/80">
              {pad(i + 1)} · {plain(s.title).slice(0, 38)}
            </span>
            <span
              className={`block rounded-full border transition-all duration-500 ${
                i === index ? 'h-[11px] w-[11px] border-accent bg-accent' : i < index ? 'h-[7px] w-[7px] border-ink/50 bg-ink/40' : 'h-[7px] w-[7px] border-ink/35 bg-transparent'
              }`}
            />
          </button>
        ))}
      </nav>

      {/* progress: plain bar, or a wavy thread with a knot wherever the speaker changes (theme.progress) */}
      {theme.progress === 'thread' ? (
        <Thread index={index} />
      ) : (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-ink/8">
          <div className="h-full bg-accent transition-[width] duration-700 ease-out" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
      )}
      {/* who is speaking (multi-speaker decks) */}
      {slide.speaker && new Set(slides.map((s) => s.speaker).filter(Boolean)).size > 1 && (
        <div className="absolute bottom-[18px] left-[56px] text-[13px] tracking-[0.14em] text-muted uppercase">
          <span className="mr-2 inline-block h-[6px] w-[6px] rounded-full bg-accent align-middle" />
          {slide.speaker}
        </div>
      )}
      <div className="absolute bottom-[18px] right-[56px] text-[13px] tracking-[0.14em] text-muted/70 uppercase">
        ← → · O · S · ?
      </div>
    </div>
  );
}

/** Wavy progress thread: fills as the talk advances; a knot marks each change of speaker. */
function Thread({ index }: { index: number }) {
  const W = 1920;
  const n = slides.length;
  const x = (i: number) => (n <= 1 ? W : (i / (n - 1)) * (W - 120) + 60);
  let d = 'M0 10';
  for (let px = 0; px < W; px += 40) d += ` Q${px + 10} ${px % 80 ? 16 : 4} ${px + 20} 10 T${px + 40} 10`;
  const knots = slides.map((s, i) => (i > 0 && s.speaker && s.speaker !== slides[i - 1].speaker ? x(i) : null)).filter((v): v is number => v !== null);
  const p = n <= 1 ? 1 : index / (n - 1);
  return (
    <svg className="absolute bottom-[2px] left-0 h-[20px] w-full" viewBox={`0 0 ${W} 20`} preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke="var(--c-ink)" strokeOpacity={0.15} strokeWidth={1.5} />
      <path d={d} fill="none" stroke="var(--c-accent)" strokeWidth={2} pathLength={100} strokeDasharray={`${Math.max(0.5, p * 100)} 200`} style={{ transition: 'stroke-dasharray 0.7s ease-out' }} />
      {knots.map((k) => (
        <circle key={k} cx={k} cy={10} r={4} fill={k <= x(index) ? 'var(--c-accent)' : 'var(--c-bg)'} stroke="var(--c-accent)" strokeWidth={1.5} />
      ))}
    </svg>
  );
}
