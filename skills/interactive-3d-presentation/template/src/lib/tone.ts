import { theme } from '../content/theme';
import type { Tone } from '../types';

export const toneHex = (t: Tone | undefined, fallback: Tone = 'ink'): string => {
  const c = theme.colors;
  switch (t ?? fallback) {
    case 'accent': return c.accent;
    case 'alert': return c.alert;
    case 'cool': return c.cool;
    case 'muted': return c.muted;
    default: return c.ink;
  }
};

/** Tailwind text color class per tone (static strings so Tailwind can see them). */
export const toneText: Record<Tone, string> = {
  accent: 'text-accent',
  alert: 'text-alert',
  cool: 'text-cool',
  ink: 'text-ink',
  muted: 'text-muted',
};
export const toneBorder: Record<Tone, string> = {
  accent: 'border-accent',
  alert: 'border-alert',
  cool: 'border-cool',
  ink: 'border-ink',
  muted: 'border-muted',
};
export const toneBg: Record<Tone, string> = {
  accent: 'bg-accent',
  alert: 'bg-alert',
  cool: 'bg-cool',
  ink: 'bg-ink',
  muted: 'bg-muted',
};
