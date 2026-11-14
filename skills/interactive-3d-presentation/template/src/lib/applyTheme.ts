import { theme } from '../content/theme';
import { PRESET_NAMES } from '../themes';

/** Push the active theme into CSS variables + html data attributes (consumed by index.css / Tailwind). */
export function applyTheme() {
  const root = document.documentElement;
  const r = root.style;
  for (const [k, v] of Object.entries(theme.colors)) r.setProperty(`--c-${k}`, v);
  r.setProperty('--f-display', theme.fonts.display);
  r.setProperty('--f-sans', theme.fonts.sans);
  r.setProperty('--f-mono', theme.fonts.mono);
  r.setProperty('--dw', String(theme.displayWeight));
  r.setProperty('--dtrack', theme.displayTracking);
  r.setProperty('--radius', `${theme.radius}px`);
  r.setProperty('--grain', String(theme.grain));
  root.dataset.mode = theme.mode;
  root.dataset.skin = theme.skin;
  root.dataset.surface = theme.surface;
  root.dataset.theme = theme.name;
  root.style.colorScheme = theme.mode;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.colors.bg);
}

/** Dev convenience: cycle presets via ?theme= (key T). */
export function cycleTheme() {
  const url = new URL(location.href);
  const cur = url.searchParams.get('theme') ?? theme.name;
  const next = PRESET_NAMES[(PRESET_NAMES.indexOf(cur as (typeof PRESET_NAMES)[number]) + 1) % PRESET_NAMES.length];
  url.searchParams.set('theme', next);
  location.href = url.toString();
}
