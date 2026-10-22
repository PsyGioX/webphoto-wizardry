/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { useCallback, useEffect, useState } from 'react';
import { Eye, Redo2, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CropOverlay } from '@/components/CropOverlay';
import { ImageStage } from '@/components/ImageStage';
import { ToolPanel } from '@/components/ToolPanel';
import { ResizeDialog } from '@/components/ResizeDialog';
import { CROP_RATIOS, fitAspect, roundRect, type Rect } from '@/lib/cropMath';
import { hasEffect } from '@/lib/filters';
import { useI18n } from '@/i18n/I18nProvider';
import type { ImageEditor } from '@/hooks/useImageEditor';

interface CropSession {
  rect: Rect;
  ratio: string;
  base: HTMLCanvasElement;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
}

const isTyping = (target: EventTarget | null) => {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
};

export function EditorWorkspace({ editor }: { editor: ImageEditor }) {
  const { m } = useI18n();
  const state = editor.state!;
  const { width: W, height: H } = editor.size;

  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [comparing, setComparing] = useState(false);
  const [crop, setCrop] = useState<CropSession | null>(null);
  const [tolerance, setTolerance] = useState(40);
  const [resizeOpen, setResizeOpen] = useState(false);

  // A crop session only applies to the exact picture it started on. Undo, rotate or a new base ends it.
  const cropping =
    crop !== null &&
    crop.base === state.base &&
    crop.rotation === state.rotation &&
    crop.flipH === state.flipH &&
    crop.flipV === state.flipV;
  // Drop a stale session for good, so redoing back to the same picture does not silently resume it.
  if (crop !== null && !cropping) setCrop(null);
  const cropRatio = cropping ? crop.ratio : 'free';
  const cropRect: Rect = cropping ? crop.rect : fitAspect(null, W, H);
  const aspect = CROP_RATIOS.find((r) => r.id === cropRatio)?.value ?? null;
  const onCanvas = useCallback((c: HTMLCanvasElement | null) => setCanvas(c), []);

  const startCrop = () =>
    setCrop({
      rect: fitAspect(null, W, H),
      ratio: 'free',
      base: state.base,
      rotation: state.rotation,
      flipH: state.flipH,
      flipV: state.flipV,
    });
  const changeRatio = (id: string) => {
    const value = CROP_RATIOS.find((r) => r.id === id)?.value ?? null;
    setCrop((c) => (c ? { ...c, ratio: id, rect: fitAspect(value, W, H) } : c));
  };
  const applyCrop = () => {
    if (!cropping) return;
    setCrop(null);
    editor.applyCrop(roundRect(crop.rect));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && !isTyping(e.target) && !document.querySelector('[role="dialog"]')) {
        const k = e.key.toLowerCase();
        if (k === 'z' && !e.shiftKey) {
          e.preventDefault();
          editor.undo();
        } else if ((k === 'z' && e.shiftKey) || k === 'y') {
          e.preventDefault();
          editor.redo();
        }
      } else if (cropping && e.key === 'Escape') {
        setCrop(null);
      } else if (cropping && e.key === 'Enter' && e.target === document.body) {
        applyCrop();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }); // re-bound every render so handlers always see current state

  // Warn before closing the tab with unsaved edits
  useEffect(() => {
    if (!editor.canUndo) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [editor.canUndo]);

  const sizeLabel = m.crop.size(Math.round(cropRect.width), Math.round(cropRect.height));
  const canCompare = hasEffect(state.adjustments, state.filterId);
  const holdOn = () => setComparing(true);
  const holdOff = () => setComparing(false);

  return (
    <div className="container grid gap-4 py-4 sm:py-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div className="min-w-0 space-y-3">
        <ImageStage state={state} comparing={comparing} busy={editor.busy} busyLabel={m.stage.busy} onCanvas={onCanvas}>
          {cropping && (
            <CropOverlay
              canvas={canvas}
              imageWidth={W}
              imageHeight={H}
              rect={cropRect}
              aspect={aspect}
              label={m.tools.crop}
              sizeLabel={sizeLabel}
              onChange={(rect) => setCrop((c) => (c ? { ...c, rect } : c))}
            />
          )}
        </ImageStage>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={editor.undo} disabled={!editor.canUndo || editor.busy} aria-label={m.stage.undo} title={`${m.stage.undo} (Ctrl+Z)`}>
            <Undo2 />
            <span className="hidden sm:inline">{m.stage.undo}</span>
          </Button>
          <Button variant="outline" onClick={editor.redo} disabled={!editor.canRedo || editor.busy} aria-label={m.stage.redo} title={`${m.stage.redo} (Ctrl+Shift+Z)`}>
            <Redo2 />
            <span className="hidden sm:inline">{m.stage.redo}</span>
          </Button>
          <Button
            variant="outline"
            disabled={!canCompare}
            onPointerDown={holdOn}
            onPointerUp={holdOff}
            onPointerLeave={holdOff}
            onPointerCancel={holdOff}
            onBlur={holdOff}
            onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && holdOn()}
            onKeyUp={holdOff}
            onContextMenu={(e) => e.preventDefault()}
            className="touch-none select-none"
          >
            <Eye />
            {m.stage.compare}
          </Button>
          <p className="ml-auto text-sm tabular-nums text-muted-foreground">{m.stage.size(W, H)}</p>
        </div>
      </div>

      <ToolPanel
        editor={editor}
        cropping={cropping}
        cropRatio={cropRatio}
        cropSizeLabel={sizeLabel}
        tolerance={tolerance}
        onTolerance={setTolerance}
        onStartCrop={startCrop}
        onCropRatio={changeRatio}
        onApplyCrop={applyCrop}
        onCancelCrop={() => setCrop(null)}
        onResize={() => setResizeOpen(true)}
        className="lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100dvh-5.5rem)] lg:overflow-y-auto"
      />

      <ResizeDialog open={resizeOpen} width={W} height={H} onOpenChange={setResizeOpen} onApply={editor.resize} />
    </div>
  );
}
