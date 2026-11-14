import { notes, slides } from '../content';
import { t } from '../i18n';
import { useDeck } from '../deck/store';
import { plain } from '../lib/rich';

const label = t('notes');

/** Speaker notes drawer (S / N), synced with the current slide. Scrollable inside. */
export function NotesDrawer() {
  const open = useDeck((s) => s.notes);
  const index = useDeck((s) => s.index);
  const toggle = useDeck((s) => s.toggle);
  const slide = slides[index];
  const text = notes[slide.id];

  return (
    <aside
      className={`fixed bottom-0 right-0 top-0 z-50 flex w-[min(520px,92vw)] flex-col border-l hairline bg-bg/94 backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
      aria-hidden={!open}
    >
      <div className="flex items-center justify-between border-b hairline px-7 py-5 font-mono text-[12px] tracking-[0.16em] text-muted uppercase">
        <span>
          {label} · {String(index + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}
        </span>
        <button onClick={() => toggle('notes', false)} className="hover:text-ink">
          {t('close')} (S)
        </button>
      </div>
      <div className="px-7 pt-6 font-display text-[22px] leading-tight font-bold text-ink">{plain(slide.title)}</div>
      <div data-scrollable className="scroll-thin flex-1 overflow-y-auto px-7 py-5 text-[17px] leading-[1.7] whitespace-pre-line text-ink/85">
        {text ?? <span className="text-muted italic">{t('noNotes')} ({slide.id}).</span>}
      </div>
      {index < slides.length - 1 && (
        <div className="border-t hairline px-7 py-4 font-mono text-[12px] text-muted">
          {t('next')} → <span className="text-ink/80">{plain(slides[index + 1].title)}</span>
        </div>
      )}
    </aside>
  );
}
