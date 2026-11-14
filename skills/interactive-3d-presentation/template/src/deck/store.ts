import { create } from 'zustand';
import { slides } from '../content';
import { beatCount } from './beats';

type Overlay = 'overview' | 'notes' | 'help' | 'cite';

interface DeckState {
  index: number;
  /** current beat (nhịp) inside the slide, 0..beatCount */
  beat: number;
  dir: 1 | -1;
  overview: boolean;
  notes: boolean;
  help: boolean;
  /** K: highlight every cited element on the slide */
  cite: boolean;
  /** open source drawer (source id) */
  source: string | null;
  /** viewport box of the clicked citation (leader line start) */
  sourceFrom: { x: number; y: number; w: number; h: number } | null;
  /** presentation clock start (ms epoch) — T starts / restarts */
  clock: number | null;
  go: (i: number, beat?: number) => void;
  next: () => void;
  prev: () => void;
  toggle: (o: Overlay, v?: boolean) => void;
  openSource: (id: string | null, from?: { x: number; y: number; w: number; h: number } | null) => void;
  startClock: () => void;
  closeAll: () => void;
}

const clamp = (i: number) => Math.max(0, Math.min(slides.length - 1, i));
/** #3 or #3.2 (slide 3, beat 2) */
const fromHash = () => {
  const [s, b] = location.hash.replace('#', '').split('.');
  const n = parseInt(s, 10);
  const i = Number.isFinite(n) ? clamp(n - 1) : 0;
  const k = parseInt(b ?? '0', 10);
  return { i, b: Number.isFinite(k) ? Math.min(Math.max(k, 0), beatCount(slides[i])) : 0 };
};

const start = fromHash();

export const useDeck = create<DeckState>((set, get) => ({
  index: start.i,
  beat: start.b,
  dir: 1,
  overview: false,
  notes: false,
  help: false,
  cite: false,
  source: null,
  sourceFrom: null,
  clock: null,
  go: (i, beat = 0) => {
    const t = clamp(i);
    const cur = get().index;
    if (t === cur) {
      if (beat !== get().beat) set({ beat: Math.min(beat, beatCount(slides[t])) });
      return;
    }
    set({ index: t, beat: Math.min(beat, beatCount(slides[t])), dir: t > cur ? 1 : -1, cite: false, source: null });
  },
  next: () => {
    const { index, beat } = get();
    if (beat < beatCount(slides[index])) set({ beat: beat + 1, dir: 1 });
    else get().go(index + 1, 0);
  },
  prev: () => {
    const { index, beat } = get();
    if (beat > 0) set({ beat: beat - 1, dir: -1 });
    else if (index > 0) get().go(index - 1, beatCount(slides[index - 1])); // land on the previous slide's last beat
  },
  toggle: (o, v) => set((s) => ({ [o]: v ?? !s[o] }) as Partial<DeckState>),
  openSource: (id, from = null) => set({ source: id, sourceFrom: id ? from : null }),
  startClock: () => set({ clock: Date.now() }),
  closeAll: () => set({ overview: false, notes: false, help: false, cite: false, source: null }),
}));

/** Presenter window sync (same origin, any tab): see hud/PresenterView.tsx */
export const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('deck-3d') : null;

const post = () => {
  const s = useDeck.getState();
  channel?.postMessage({ type: 'state', index: s.index, beat: s.beat, clock: s.clock });
};

if (!new URLSearchParams(location.search).has('presenter')) {
  useDeck.subscribe((s, p) => {
    if (s.index !== p.index || s.beat !== p.beat) {
      history.replaceState(null, '', `#${s.index + 1}${s.beat ? `.${s.beat}` : ''}`);
      post();
    }
    if (s.clock !== p.clock) post();
  });
  channel?.addEventListener('message', (e) => {
    const d = e.data as { type: string; index?: number };
    const st = useDeck.getState();
    if (d.type === 'go' && typeof d.index === 'number') st.go(d.index);
    if (d.type === 'next') st.next();
    if (d.type === 'prev') st.prev();
    if (d.type === 'clock') st.startClock();
    if (d.type === 'hello') post();
  });
  window.addEventListener('hashchange', () => {
    const h = fromHash();
    useDeck.getState().go(h.i, h.b);
  });
}
