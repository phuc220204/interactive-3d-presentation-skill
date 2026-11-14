import { lazy, Suspense } from 'react';
import { deck } from './content';
import { Deck } from './deck/Deck';
import { PresenterView } from './hud/PresenterView';

const params = new URLSearchParams(location.search);
const ThreeUIProbe = lazy(() => import('./threeui/ThreeUIProbe'));
const ScrollDeck = lazy(() => import('./deck/ScrollDeck').then((m) => ({ default: m.ScrollDeck })));

/**
 *  /                      → the deck (16:9 slides, beats, presenter tools)
 *  /?mode=scroll          → landing page / scrollytelling (or deck.mode = 'scroll')
 *  /?presenter            → presenter window (notes, beats, timer, next slide)
 *  /?threeui=<Name>       → probe one ThreeUI effect on the active theme (add &theme=whiteboard …)
 *  /?studio               → (dev) Theatre.js studio to author camera sequences
 */
export default function App() {
  if (params.has('presenter')) return <PresenterView />;
  if (params.has('threeui'))
    return (
      <Suspense fallback={null}>
        <ThreeUIProbe name={params.get('threeui') ?? ''} />
      </Suspense>
    );
  if (params.get('mode') === 'scroll' || (deck.mode === 'scroll' && params.get('mode') !== 'deck'))
    return (
      <Suspense fallback={null}>
        <ScrollDeck />
      </Suspense>
    );
  return <Deck />;
}
