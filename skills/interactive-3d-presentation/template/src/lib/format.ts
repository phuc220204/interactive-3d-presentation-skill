import { locale } from '../i18n';

export const fmt = (v: number, decimals = 0) =>
  new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);
