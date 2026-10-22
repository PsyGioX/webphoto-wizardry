/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { forwardRef, useLayoutEffect, useRef, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { drawTransformed } from '@/lib/imageOps';
import { buildOps, opsToCss } from '@/lib/filters';
import type { EditState } from '@/hooks/useImageEditor';

interface ImageStageProps {
  state: EditState;
  comparing: boolean;
  busy: boolean;
  busyLabel: string;
  onCanvas: (canvas: HTMLCanvasElement | null) => void;
  children?: ReactNode;
}

/**
 * Shows the transformed image on a canvas. Colour adjustments and filters are applied with a CSS filter,
 * which is instant on the GPU; the same operations are baked in at export time.
 */
export const ImageStage = forwardRef<HTMLDivElement, ImageStageProps>(function ImageStage(
  { state, comparing, busy, busyLabel, onCanvas, children },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    if (canvasRef.current) drawTransformed(canvasRef.current, state.base, state);
  }, [state.base, state.rotation, state.flipH, state.flipV]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    onCanvas(canvasRef.current);
    return () => onCanvas(null);
  }, [onCanvas]);

  const filter = comparing ? 'none' : opsToCss(buildOps(state.adjustments, state.filterId));

  return (
    <div
      ref={ref}
      className="checker relative flex min-h-[14rem] items-center justify-center overflow-hidden rounded-2xl border p-3 sm:p-5"
    >
      <canvas
        ref={canvasRef}
        className="block max-h-[52dvh] max-w-full rounded-sm shadow-lg lg:max-h-[calc(100dvh-14rem)]"
        style={{ filter }}
      />
      {children}
      {busy && (
        <div
          role="status"
          className="absolute inset-0 flex items-center justify-center gap-2 bg-background/70 text-sm font-medium backdrop-blur-xs"
        >
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          {busyLabel}
        </div>
      )}
    </div>
  );
});
