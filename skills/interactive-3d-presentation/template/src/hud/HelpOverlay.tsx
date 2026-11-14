import { useDeck } from '../deck/store';
import { t, type StringKey } from '../i18n';

const KEYS: [string, StringKey][] = [
  ['→  Space  PgDn', 'key.next'],
  ['←  PgUp', 'key.prev'],
  ['Click', 'key.click'],
  ['Home / End', 'key.ends'],
  ['O  M', 'key.overview'],
  ['S  N', 'key.notes'],
  ['P', 'key.presenter'],
  ['K', 'key.cite'],
  ['T', 'key.timer'],
  ['F', 'key.fullscreen'],
  ['D', 'look'],
  ...(import.meta.env.DEV ? ([['Shift+T', 'key.theme']] as [string, StringKey][]) : []),
  ['Wheel / Swipe', 'key.wheel'],
  ['Esc', 'key.esc'],
];

export function HelpOverlay() {
  const open = useDeck((s) => s.help);
  const toggle = useDeck((s) => s.toggle);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-lg" onClick={() => toggle('help', false)}>
      <div className="card w-[min(560px,92vw)] p-8">
        <div className="mb-5 font-mono text-[12px] tracking-[0.16em] text-accent uppercase">{t('help')}</div>
        <dl className="grid grid-cols-[180px_1fr] gap-y-3 text-[15px]">
          {KEYS.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="font-mono text-ink">{k}</dt>
              <dd className="text-ink/70">{t(v)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
