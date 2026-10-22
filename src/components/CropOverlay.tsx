/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { moveRect, resizeRect, type Handle, type Rect } from '@/lib/cropMath';

interface CropOverlayProps {
  canvas: HTMLCanvasElement | null;
  /** Size of the displayed image in image pixels. */
  imageWidth: number;
  imageHeight: number;
  rect: Rect;
  aspect: number | null;
  label: string;
  sizeLabel: string;
  onChange: (rect: Rect) => void;
}

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

type DragKind = Handle | 'move';

const CORNERS: { id: Handle; cls: string; cursor: string }[] = [
  { id: 'nw', cls: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2', cursor: 'nwse-resize' },
  { id: 'ne', cls: 'right-0 top-0 translate-x-1/2 -translate-y-1/2', cursor: 'nesw-resize' },
  { id: 'sw', cls: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2', cursor: 'nesw-resize' },
  { id: 'se', cls: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2', cursor: 'nwse-resize' },
];

const EDGES: { id: Handle; cls: string; pill: string; cursor: string }[] = [
  { id: 'n', cls: 'left-3 right-3 top-0 h-5 -translate-y-1/2', pill: 'h-1.5 w-8', cursor: 'ns-resize' },
  { id: 's', cls: 'bottom-0 left-3 right-3 h-5 translate-y-1/2', pill: 'h-1.5 w-8', cursor: 'ns-resize' },
  { id: 'w', cls: 'left-0 top-3 bottom-3 w-5 -translate-x-1/2', pill: 'h-8 w-1.5', cursor: 'ew-resize' },
  { id: 'e', cls: 'right-0 top-3 bottom-3 w-5 translate-x-1/2', pill: 'h-8 w-1.5', cursor: 'ew-resize' },
];

/** Tracks where the canvas sits inside its positioned parent, so the overlay can sit exactly on top of it. */
function useCanvasBox(canvas: HTMLCanvasElement | null): Box {
  const [box, setBox] = useState<Box>({ left: 0, top: 0, width: 0, height: 0 });
  useLayoutEffect(() => {
    if (!canvas) return;
    const update = () =>
      setBox({ left: canvas.offsetLeft, top: canvas.offsetTop, width: canvas.offsetWidth, height: canvas.offsetHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(canvas);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [canvas]);
  return box;
}

export function CropOverlay({ canvas, imageWidth: W, imageHeight: H, rect, aspect, label, sizeLabel, onChange }: CropOverlayProps) {
  const box = useCanvasBox(canvas);
  const areaRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ kind: DragKind; x: number; y: number; rect: Rect; sx: number; sy: number } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    frameRef.current?.focus({ preventScroll: true });
  }, []);

  const onDown = (e: PointerEvent<HTMLElement>) => {
    const area = areaRef.current;
    const kind = e.currentTarget.dataset.kind as DragKind | undefined;
    if (!area || !kind) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const b = area.getBoundingClientRect();
    drag.current = { kind, x: e.clientX, y: e.clientY, rect, sx: W / b.width, sy: H / b.height };
  };

  const onMove = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.x) * d.sx;
    const dy = (e.clientY - d.y) * d.sy;
    onChange(d.kind === 'move' ? moveRect(d.rect, dx, dy, W, H) : resizeRect(d.rect, d.kind, dx, dy, W, H, aspect));
  };

  const onUp = (e: PointerEvent<HTMLElement>) => {
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = (e.shiftKey ? 0.05 : 0.01) * Math.max(W, H);
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const d = delta[e.key];
    if (!d) return;
    e.preventDefault();
    onChange(moveRect(rect, d[0], d[1], W, H));
  };

  const pct = (v: number, total: number) => `${(v / total) * 100}%`;
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;

  return (
    <div ref={areaRef} className="absolute touch-none select-none" style={box} onPointerMove={onMove} onPointerUp={onUp}>
      {/* Dimmed surroundings */}
      <div className="pointer-events-none absolute inset-x-0 top-0 bg-black/55" style={{ height: pct(rect.y, H) }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/55" style={{ height: pct(H - bottom, H) }} />
      <div
        className="pointer-events-none absolute left-0 bg-black/55"
        style={{ top: pct(rect.y, H), height: pct(rect.height, H), width: pct(rect.x, W) }}
      />
      <div
        className="pointer-events-none absolute right-0 bg-black/55"
        style={{ top: pct(rect.y, H), height: pct(rect.height, H), width: pct(W - right, W) }}
      />

      <div
        ref={frameRef}
        role="group"
        tabIndex={0}
        aria-label={label}
        onKeyDown={onKey}
        data-kind="move"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        className="absolute cursor-move outline outline-2 outline-white focus-visible:outline-spark"
        style={{ left: pct(rect.x, W), top: pct(rect.y, H), width: pct(rect.width, W), height: pct(rect.height, H) }}
      >
        {/* Rule-of-thirds guides */}
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute inset-y-0 left-1/3 w-px bg-white" />
          <div className="absolute inset-y-0 left-2/3 w-px bg-white" />
          <div className="absolute inset-x-0 top-1/3 h-px bg-white" />
          <div className="absolute inset-x-0 top-2/3 h-px bg-white" />
        </div>

        <span className="pointer-events-none absolute left-1.5 top-1.5 rounded-sm bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
          {sizeLabel}
        </span>

        {EDGES.map((h) => (
          <div
            key={h.id}
            className={`absolute flex items-center justify-center ${h.cls}`}
            style={{ cursor: h.cursor }}
            data-kind={h.id}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
          >
            <span className={`rounded-full bg-white shadow-sm ${h.pill}`} />
          </div>
        ))}
        {CORNERS.map((h) => (
          <div
            key={h.id}
            className={`absolute flex h-8 w-8 items-center justify-center ${h.cls}`}
            style={{ cursor: h.cursor }}
            data-kind={h.id}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
          >
            <span className="h-4 w-4 rounded-full border-2 border-primary bg-white shadow-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
