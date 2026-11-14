import type { DeckMeta, Slide } from '../types';

/**
 * EXAMPLE · Business / pitch (en, neon)
 * "Lumen" is a FICTIONAL company and every number here is illustrative.
 * Shows: hero metric + towers, phone/chart cards, area chart + metric row, donut, roadmap timeline,
 * bento, ThreeUI closing.
 */
export const deck: DeckMeta = { title: 'Lumen — smarter energy for small shops', brand: 'LUMEN · SAMPLE PITCH', lang: 'en', targetMinutes: 8 };

export const slides: Slide[] = [
  {
    id: 's01',
    section: 'Intro',
    layout: 'cover',
    kicker: 'Seed round · sample pitch',
    title: 'Lumen: **smarter energy** for small shops',
    lead: 'A plug-in meter and an app that cut a shop’s electricity bill without new hardware installs.',
    meta: [
      { label: 'Stage', value: 'Seed' },
      { label: 'Ask', value: '$1.5M (illustrative)' },
      { label: 'Market', value: 'SE Asia retail' },
    ],
    scene: { name: 'threeui', component: 'StreamConvergenceBackground', placement: 'background', purpose: 'Energy streams converging into one flow — the product joins scattered devices into one meter.' },
  },
  {
    id: 's02',
    section: 'Problem',
    title: 'Small shops **overpay** for power',
    blocks: [
      { type: 'metric', hero: true, items: [{ value: 23, suffix: '%', label: 'of a typical shop’s energy is wasted on idle equipment (illustrative)', tone: 'alert' }] },
      { type: 'callout', tone: 'cool', label: 'Why now', body: 'Cheap sensors + mobile payments make per-device metering affordable.' },
    ],
    scene: { name: 'towers', purpose: 'Two stacks compare the monthly bill before and after — the saving is the gap.', state: { unit: '$ / month', items: [{ label: 'Today', value: 310, display: '$310', tone: 'alert' }, { label: 'With Lumen', value: 238, display: '$238', tone: 'accent' }] } },
    scope: 'All figures illustrative.',
  },
  {
    id: 's03',
    section: 'Product',
    layout: 'split-right',
    title: 'Plug in, open the app, **save**',
    blocks: [{ type: 'list', style: 'check', items: ['Per-device usage in real time', 'Automatic off-hours schedules', 'Monthly savings report'] }],
    scene: { name: 'cards', purpose: 'The app screen, its usage chart and schedules float as the three things a shop owner touches.', state: { cards: [{ kind: 'phone', label: 'Lumen app', tone: 'accent' }, { kind: 'chart', label: 'Usage', tone: 'cool' }, { kind: 'note', label: 'Schedules' }] } },
  },
  {
    id: 's03b',
    section: 'How it works',
    title: 'One meter, **three** automatic savings',
    blocks: [
      { type: 'lottie', src: '/assets/lottie/energy-pulse.json', alt: 'Animated pulse: the meter senses every device', height: 420 },
      { type: 'list', style: 'numbered', stepwise: true, items: ['Detects idle devices', 'Switches them off after hours', 'Reports the saving every month'] },
    ],
    scene: { name: 'ambient' },
    sources: ['lottie-pulse'],
  },
  {
    id: 's04',
    section: 'Traction',
    layout: 'grid',
    title: 'Shops keep **joining** month after month',
    blocks: [
      {
        type: 'chart',
        kind: 'area',
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
        series: [{ name: 'Active shops', values: [40, 65, 90, 140, 210, 290, 380, 510], tone: 'accent' }],
        height: 290,
        caption: 'Illustrative pilot data.',
      },
      { type: 'metric', items: [{ value: 510, label: 'Active shops' }, { value: 92, suffix: '%', label: 'Monthly retention', tone: 'cool' }, { value: 4.8, decimals: 1, suffix: '/5', label: 'App rating' }] },
    ],
    scene: { name: 'ambient', state: { tone: 'accent' } },
    scope: 'Illustrative data.',
  },
  {
    id: 's05',
    section: 'Use of funds',
    title: 'Where the **money** goes',
    blocks: [{ type: 'chart', kind: 'donut', labels: ['Product & engineering', 'Sales & partnerships', 'Hardware inventory', 'Operations'], series: [{ name: 'Funds', values: [45, 30, 15, 10] }], height: 300 }],
    scene: { name: 'ambient' },
    scope: 'Illustrative allocation.',
  },
  {
    id: 's06',
    section: 'Roadmap',
    layout: 'grid',
    title: 'Next **12 months**',
    blocks: [
      {
        type: 'timeline',
        active: 0,
        items: [
          { date: 'Q1', title: 'Pilot → paid', body: 'Convert pilot shops.', tone: 'accent' },
          { date: 'Q2', title: 'Partnerships', body: 'Utilities & POS vendors.' },
          { date: 'Q3', title: 'New city', body: 'Second market launch.' },
          { date: 'Q4', title: 'Series A', body: 'Scale sales team.' },
        ],
      },
      {
        type: 'bento',
        columns: 3,
        items: [
          { tag: 'Team', title: 'Hardware + fintech founders', body: 'Built and sold IoT products before.' },
          { tag: 'Moat', title: 'Device-level data', body: 'Better savings models over time.', tone: 'accent' },
          { tag: 'Risk', title: 'Hardware margins', body: 'Mitigated by subscription pricing.', tone: 'alert' },
        ],
      },
    ],
    scene: { name: 'timeline', purpose: 'Quarters on a rising helix; the current quarter faces the audience.', state: { items: [{ label: 'Q1', tone: 'accent' }, { label: 'Q2' }, { label: 'Q3' }, { label: 'Q4' }], active: 0 } },
  },
  {
    id: 's07',
    section: 'Ask',
    layout: 'center',
    kicker: 'The ask',
    title: 'Join us to **light up** 10,000 shops',
    subtitle: 'hello@example.com',
    scene: { name: 'threeui', component: 'EmeraldHorizonBackground', placement: 'background', purpose: 'A rising horizon as the closing image for the ask.' },
  },
  { id: 's08', section: 'Notes', layout: 'references', title: 'Data notes', scene: { name: 'ambient' } },
];
