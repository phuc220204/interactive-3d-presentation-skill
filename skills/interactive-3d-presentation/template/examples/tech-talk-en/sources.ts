import type { Source } from '../types';

export const sources: Source[] = [
  {
    id: 'diagram-layers',
    kind: 'diagram',
    license: 'CC0',
    short: 'Deck diagram',
    apa: 'Deck 3D template. (2026). Fully connected layers [SVG diagram]. Made for this deck.',
    assets: ['/assets/diagrams/neural-layers.svg'],
  },
  {
    id: 'goodfellow-2016',
    kind: 'text',
    short: 'Goodfellow et al. (2016)',
    apa: 'Goodfellow, I., Bengio, Y., & Courville, A. (2016). Deep learning. MIT Press. https://www.deeplearningbook.org/',
  },
  {
    id: 'rumelhart-1986',
    kind: 'text',
    short: 'Rumelhart et al. (1986)',
    apa: 'Rumelhart, D. E., Hinton, G. E., & Williams, R. J. (1986). Learning representations by back-propagating errors. Nature, 323(6088), 533–536. https://doi.org/10.1038/323533a0',
  },
];
