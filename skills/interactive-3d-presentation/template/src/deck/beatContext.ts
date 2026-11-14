import { createContext, useContext } from 'react';
import { useDeck } from './store';

/** Scroll mode reveals every beat of every section: it provides a fixed beat; decks use the store's beat. */
export const BeatOverride = createContext<number | null>(null);

export function useBeat() {
  const forced = useContext(BeatOverride);
  const beat = useDeck((s) => s.beat);
  return forced ?? beat;
}
