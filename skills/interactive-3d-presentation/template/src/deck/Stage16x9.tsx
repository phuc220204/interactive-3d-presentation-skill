import { useLayoutEffect, useState, type ReactNode } from 'react';

/** Design resolution. ALL slide layouts are authored in these pixels. */
export const STAGE_W = 1920;
export const STAGE_H = 1080;

/** Live stage geometry (viewport px) — read by the 3D layer to anchor objects to layout regions. */
export const stage = { left: 0, top: 0, width: STAGE_W, height: STAGE_H, scale: 1, vw: STAGE_W, vh: STAGE_H };

export function measureStage() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min(vw / STAGE_W, vh / STAGE_H);
  stage.scale = scale;
  stage.width = STAGE_W * scale;
  stage.height = STAGE_H * scale;
  stage.left = (vw - stage.width) / 2;
  stage.top = (vh - stage.height) / 2;
  stage.vw = vw;
  stage.vh = vh;
  document.documentElement.style.setProperty('--stage-scale', String(scale));
  return scale;
}

/** Strict 16:9 letterboxed stage, scaled to fit the viewport (no page scroll, ever). */
export function Stage16x9({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(() => measureStage());
  useLayoutEffect(() => {
    const on = () => setScale(measureStage());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      <div
        data-stage
        className="pointer-events-auto absolute"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          left: stage.left,
          top: stage.top,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        {children}
      </div>
    </div>
  );
}
