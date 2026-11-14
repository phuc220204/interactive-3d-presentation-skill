import type { DeckMeta, Slide } from '../types';

/**
 * EXAMPLE · Technology / programming (en, blueprint)
 * Shows: English UI, math block + inline math, code block with highlighted lines, plot curve + surface,
 * network, flow, line chart, ThreeUI background. Numbers on the chart are illustrative.
 */
export const deck: DeckMeta = { title: 'How a Neural Network Learns', brand: 'TECH TALK · SAMPLE', lang: 'en', targetMinutes: 20 };

export const slides: Slide[] = [
  {
    id: 's01',
    section: 'Intro',
    layout: 'cover',
    kicker: 'Tech talk · 20 min',
    title: 'How a neural network **learns**',
    lead: 'From a single weighted sum to gradient descent on a loss landscape — in six slides.',
    meta: [
      { label: 'Audience', value: 'Developers' },
      { label: 'Level', value: 'Intro' },
      { label: 'Format', value: 'Talk + demo' },
    ],
    scene: { name: 'morph', purpose: 'A regular grid of particles — the network starts as a blank, untrained structure.', state: { shape: 'grid', tone: 'cool' } },
  },
  {
    id: 's02',
    section: 'Neuron',
    title: 'A neuron is a **weighted sum**',
    lead: 'Each input $$x_i$$ is scaled by a weight $$w_i$$, summed with a bias $$b$$, then squashed by an activation $$\\sigma$$.',
    blocks: [
      { type: 'math', tex: 'y = \\sigma\\Big(\\sum_{i=1}^{n} w_i x_i + b\\Big)', caption: 'Learning = finding good values for $$w$$ and $$b$$.' },
    ],
    scene: {
      name: 'network',
      purpose: 'Inputs and a bias feed one neuron — the exact structure of the formula on the left.',
      state: {
        nodes: [
          { id: 'y', label: 'σ(·) → y', center: true, tone: 'accent' },
          { id: 'x1', label: 'x₁' },
          { id: 'x2', label: 'x₂' },
          { id: 'x3', label: 'x₃' },
          { id: 'b', label: 'bias b', tone: 'cool' },
        ],
        links: [
          { a: 'x1', b: 'y', tone: 'accent' },
          { a: 'x2', b: 'y', tone: 'accent' },
          { a: 'x3', b: 'y', tone: 'accent' },
          { a: 'b', b: 'y', tone: 'cool' },
        ],
      },
    },
  },
  {
    id: 's02b',
    section: 'Layers',
    title: 'Neurons stack into **layers**',
    lead: 'Every input connects to every hidden neuron; the hidden layer feeds the output.',
    blocks: [{ type: 'diagram', src: '/assets/diagrams/neural-layers.svg', alt: 'Diagram: 3 inputs, 4 hidden neurons, 1 output, fully connected', height: 430 }],
    scene: { name: 'ambient' },
    sources: ['diagram-layers'],
  },
  {
    id: 's03',
    section: 'Activation',
    layout: 'split-right',
    title: 'The **sigmoid** squashes any input into (0, 1)',
    blocks: [
      { type: 'math', tex: '\\sigma(x) = \\frac{1}{1 + e^{-x}}' },
      { type: 'list', items: ['Smooth and differentiable everywhere', 'Saturates for large |x| → !!vanishing gradients!!', 'Modern nets often prefer **ReLU**: $$\\max(0, x)$$'] },
    ],
    scene: { name: 'plot', purpose: 'The sigmoid curve itself, so the audience sees the squashing between 0 and 1.', state: { mode: 'curve', fn: '1/(1+exp(-x))', range: [-6, 6], label: 'σ(x)', tone: 'accent' } },
  },
  {
    id: 's04',
    section: 'Training loop',
    title: 'Training is a **four-step loop**',
    blocks: [
      {
        type: 'code',
        lang: 'python',
        title: 'train.py',
        highlight: [5, 6],
        code: `for epoch in range(epochs):
    for x, y in loader:
        pred = model(x)              # 1. forward
        loss = loss_fn(pred, y)      # 2. loss
        loss.backward()              # 3. backprop
        optimizer.step()             # 4. update
        optimizer.zero_grad()`,
        caption: 'Lines 5–6 are where the learning happens.',
      },
    ],
    scene: { name: 'flow', purpose: 'Particles circulate through the four steps of the loop shown in the code.', state: { steps: [{ label: 'Forward' }, { label: 'Loss', tone: 'alert' }, { label: 'Backprop', tone: 'cool' }, { label: 'Update', tone: 'accent' }], active: 3 } },
  },
  {
    id: 's05',
    section: 'Loss landscape',
    title: 'Gradient descent walks **downhill**',
    lead: 'The loss is a surface over the weights; each step moves against the gradient.',
    blocks: [{ type: 'math', tex: 'w \\leftarrow w - \\eta \\, \\nabla_w L(w)', caption: '$$\\eta$$ = learning rate · too large → !!overshoot!!, too small → slow' }],
    scene: { name: 'plot', purpose: 'A bumpy loss surface over two weights: training means walking downhill on it.', state: { mode: 'surface', fn: '0.25*(x^2+y^2) + 0.6*sin(1.6*x)*cos(1.6*y)', range: [-3, 3], label: 'L(w₁, w₂)', tone: 'accent' } },
  },
  {
    id: 's06',
    section: 'Overfitting',
    layout: 'grid',
    title: 'Watch the **validation** curve, not just training',
    blocks: [
      {
        type: 'chart',
        kind: 'line',
        labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        series: [
          { name: 'Training loss', values: [2.1, 1.5, 1.1, 0.85, 0.66, 0.52, 0.41, 0.33, 0.27, 0.22], tone: 'cool' },
          { name: 'Validation loss', values: [2.2, 1.6, 1.25, 1.05, 0.95, 0.92, 0.94, 0.99, 1.06, 1.15], tone: 'alert' },
        ],
        decimals: 2,
        height: 330,
        caption: 'Illustrative curves · epochs on the x-axis.',
      },
      { type: 'callout', tone: 'alert', label: 'Overfitting', body: 'When validation loss turns up while training loss keeps falling, stop early or add regularisation.' },
    ],
    scene: { name: 'ambient' },
    scope: 'Illustrative data.',
  },
  {
    id: 's07',
    section: 'Takeaway',
    layout: 'center',
    kicker: 'Takeaway',
    title: 'Learning is **optimisation** with good feedback',
    subtitle: 'Weights · loss · gradients · iterate.',
    scene: { name: 'threeui', component: 'LogicCoreField', placement: 'background', purpose: 'A glowing processing core as a calm closing image for “the engine learns”.' },
  },
  { id: 's08', section: 'References', layout: 'references', title: 'References', scene: { name: 'ambient' } },
];
