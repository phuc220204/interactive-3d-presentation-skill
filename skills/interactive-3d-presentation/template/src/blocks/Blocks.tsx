import { lazy, Suspense } from 'react';
import type { Block } from '../types';
import { Metric } from './Metric';
import { Compare } from './Compare';
import { Bento } from './Bento';
import { Timeline } from './Timeline';
import { Flow } from './Flow';
import { Callout, List, Quote } from './Text';
import { Bars, Table } from './Table';
import { ImageFrame } from './ImageFrame';
import { References } from './References';
import { Chart } from './Chart';
import { Gallery, MathFormula, Video } from './Media';
import { Diagram, LottieAsset } from './Assets';
import { Dimension, Gauge, Waffle } from './Infographics';
import { Simulation } from './Simulation';
import { BeatGate } from '../deck/BeatGate';

// prism (syntax highlighting) only loads for decks that show code
const Code = lazy(() => import('./Code').then((m) => ({ default: m.Code })));

/** Block dispatcher. `wide` = full-width area (grid layout) → blocks may use more columns. */
export function Blocks({ blocks, wide = false }: { blocks: Block[]; wide?: boolean }) {
  return (
    <>
      {blocks.map((b, i) => (
        // block.beat → whole block appears at that beat; stepwise blocks gate their own items
        <BeatGate key={i} at={b.stepwise ? undefined : b.beat}>
          {b.id ? <div data-node={b.id}>{renderBlock(b, wide)}</div> : renderBlock(b, wide)}
        </BeatGate>
      ))}
    </>
  );
}

function renderBlock(b: Block, wide: boolean) {
  switch (b.type) {
    case 'metric': return <Metric block={b} wide={wide} />;
    case 'compare': return <Compare block={b} />;
    case 'bento': return <Bento block={b} wide={wide} />;
    case 'timeline': return <Timeline block={b} />;
    case 'flow': return <Flow block={b} />;
    case 'quote': return <Quote block={b} />;
    case 'callout': return <Callout block={b} />;
    case 'list': return <List block={b} />;
    case 'table': return <Table block={b} />;
    case 'bars': return <Bars block={b} />;
    case 'image': return <ImageFrame block={b} />;
    case 'references': return <References />;
    case 'chart': return <Chart block={b} />;
    case 'code': return <Suspense fallback={null}><Code block={b} /></Suspense>;
    case 'math': return <MathFormula block={b} />;
    case 'gallery': return <Gallery block={b} />;
    case 'video': return <Video block={b} />;
    case 'diagram': return <Diagram block={b} />;
    case 'lottie': return <LottieAsset block={b} />;
    case 'waffle': return <Waffle block={b} />;
    case 'gauge': return <Gauge block={b} />;
    case 'dimension': return <Dimension block={b} />;
    case 'simulation': return <Simulation block={b} />;
    default: return null;
  }
}
