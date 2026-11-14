import { sources } from '../content';
import { t } from '../i18n';
import type { Source } from '../types';

/** Source kinds listed under "image & media credits" on the references slide. */
export const MEDIA_KINDS = new Set<Source['kind']>(['photo', 'image', 'user', 'ai', 'diagram', 'video', 'model', 'lottie', 'spline', 'effect']);

/** The sources.ts entry that credits a media file (matched on `assets` or `url`). */
export function sourceForAsset(src?: string): Source | undefined {
  if (!src) return undefined;
  return sources.find((s) => s.assets?.includes(src) || s.url === src);
}

/** Mandatory provenance label: AI decoration and author-provided images are always marked as such. */
export function kindTag(s?: Source): string | undefined {
  if (s?.kind === 'ai') return t('aiAsset');
  if (s?.kind === 'user') return t('userAsset');
  return undefined;
}
