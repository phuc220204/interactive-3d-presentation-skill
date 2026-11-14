import { theme } from '../content';
import { THREEUI } from './catalog';
import { ThreeUIView } from './ThreeUIView';

/** /?threeui=<Name>[&theme=<preset>] — view one effect on the theme background, with a text sample for legibility. */
export default function ThreeUIProbe({ name }: { name: string }) {
  const entry = THREEUI[name];
  return (
    <div className="fixed inset-0 overflow-hidden bg-bg">
      <div className="absolute inset-0">
        <ThreeUIView name={name} />
      </div>
      <div className="absolute bottom-10 left-10 max-w-[760px] font-sans text-ink">
        <div className="font-mono text-[13px] tracking-[0.16em] text-muted uppercase">
          ThreeUI · {name} · {entry?.role ?? 'unknown'} · {theme.name} ({theme.mode})
        </div>
        <div className="font-display mt-3 text-[56px] leading-tight">Tiêu đề mẫu đọc rõ trên hiệu ứng</div>
        <p className="mt-2 text-[18px] text-ink/80">{entry?.use ?? 'Not in catalog'}</p>
        <div className="mt-4 flex flex-wrap gap-2 font-mono text-[12px] text-muted">
          {Object.keys(THREEUI).map((n) => (
            <a key={n} href={`?threeui=${n}&theme=${theme.name}`} className={n === name ? 'text-accent' : 'hover:text-ink'}>
              {n}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
