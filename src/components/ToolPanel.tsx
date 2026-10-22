/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { useMemo } from 'react';
import {
  Check,
  Crop,
  FlipHorizontal2,
  FlipVertical2,
  Loader2,
  Maximize2,
  RotateCcw,
  RotateCw,
  Eraser,
  Undo2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useI18n } from '@/i18n/I18nProvider';
import { FILTERS, opsToCss, type Adjustments, type FilterId } from '@/lib/filters';
import { createCanvas, get2d } from '@/lib/imageOps';
import { CROP_RATIOS } from '@/lib/cropMath';
import { cn } from '@/lib/utils';
import type { ImageEditor } from '@/hooks/useImageEditor';


interface ToolPanelProps {
  editor: ImageEditor;
  cropping: boolean;
  cropRatio: string;
  cropSizeLabel: string;
  tolerance: number;
  onTolerance: (value: number) => void;
  onStartCrop: () => void;
  onCropRatio: (id: string) => void;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
  onResize: () => void;
  className?: string;
}

function makeThumb(source: HTMLCanvasElement, size = 160): string {
  const side = Math.min(source.width, source.height);
  const sx = (source.width - side) / 2;
  const sy = (source.height - side) / 2;
  const c = createCanvas(size, size);
  const ctx = get2d(c);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, sx, sy, side, side, 0, 0, size, size);
  return c.toDataURL('image/jpeg', 0.82);
}

function ToolButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  active,
}: {
  icon: typeof Crop;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <Button
      type="button"
      variant={active ? 'default' : 'outline'}
      onClick={onClick}
      disabled={disabled}
      className="h-auto min-h-11 justify-start gap-2 whitespace-normal py-2 text-left"
    >
      <Icon aria-hidden="true" />
      <span className="leading-tight">{label}</span>
    </Button>
  );
}

export function ToolPanel({
  editor,
  cropping,
  cropRatio,
  cropSizeLabel,
  tolerance,
  onTolerance,
  onStartCrop,
  onCropRatio,
  onApplyCrop,
  onCancelCrop,
  onResize,
  className,
}: ToolPanelProps) {
  const { m } = useI18n();
  const state = editor.state;
  const thumb = useMemo(() => (state ? makeThumb(state.base) : ''), [state?.base]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!state) return null;

  const locked = cropping || editor.busy;
  const adjustmentSliders: { key: keyof Adjustments; label: string; min: number; max: number; unit: string }[] = [
    { key: 'brightness', label: m.adjust.brightness, min: 0, max: 200, unit: '%' },
    { key: 'contrast', label: m.adjust.contrast, min: 0, max: 200, unit: '%' },
    { key: 'saturation', label: m.adjust.saturation, min: 0, max: 200, unit: '%' },
    { key: 'hue', label: m.adjust.hue, min: -180, max: 180, unit: '°' },
  ];

  return (
    <aside className={cn('rounded-2xl border bg-card p-4 shadow-xs', className)}>
      <Tabs defaultValue="tools">
        <TabsList className="grid h-11 w-full grid-cols-3">
          <TabsTrigger value="tools" className="h-9">
            {m.tabs.tools}
          </TabsTrigger>
          <TabsTrigger value="adjust" className="h-9">
            {m.tabs.adjust}
          </TabsTrigger>
          <TabsTrigger value="filters" className="h-9">
            {m.tabs.filters}
          </TabsTrigger>
        </TabsList>

        {/* ---- Tools ---- */}
        <TabsContent value="tools" className="mt-5 space-y-6">
          <section aria-label={m.tools.transform} className="grid grid-cols-2 gap-2">
            <ToolButton icon={RotateCcw} label={m.tools.rotateLeft} onClick={() => editor.rotate('left')} disabled={locked} />
            <ToolButton icon={RotateCw} label={m.tools.rotateRight} onClick={() => editor.rotate('right')} disabled={locked} />
            <ToolButton icon={FlipHorizontal2} label={m.tools.flipH} onClick={() => editor.flip('h')} disabled={locked} />
            <ToolButton icon={FlipVertical2} label={m.tools.flipV} onClick={() => editor.flip('v')} disabled={locked} />
          </section>

          <section className="space-y-3">
            {!cropping ? (
              <div className="grid grid-cols-2 gap-2">
                <ToolButton icon={Crop} label={m.tools.crop} onClick={onStartCrop} disabled={editor.busy} />
                <ToolButton icon={Maximize2} label={m.tools.resize} onClick={onResize} disabled={editor.busy} />
              </div>
            ) : (
              <div className="space-y-3 rounded-xl border border-primary/40 bg-accent/40 p-3">
                <p className="text-sm text-muted-foreground">{m.crop.hint}</p>
                <div role="radiogroup" aria-label={m.crop.ratio} className="flex flex-wrap gap-1.5">
                  {CROP_RATIOS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      role="radio"
                      aria-checked={cropRatio === r.id}
                      onClick={() => onCropRatio(r.id)}
                      className={cn(
                        'h-9 min-w-[3.25rem] rounded-lg border px-3 text-sm font-medium transition-colors',
                        cropRatio === r.id ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:bg-accent',
                      )}
                    >
                      {r.label ?? m.crop.free}
                    </button>
                  ))}
                </div>
                <p className="text-xs tabular-nums text-muted-foreground">{cropSizeLabel}</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" onClick={onApplyCrop}>
                    <Check />
                    {m.crop.apply}
                  </Button>
                  <Button type="button" variant="outline" onClick={onCancelCrop}>
                    <X />
                    {m.crop.cancel}
                  </Button>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-3" aria-label={m.bg.title}>
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="bg-tolerance" className="font-medium">
                {m.bg.tolerance}
              </label>
              <span className="tabular-nums text-muted-foreground">{tolerance}</span>
            </div>
            <Slider
              id="bg-tolerance"
              min={5}
              max={120}
              step={1}
              value={[tolerance]}
              onValueChange={(v) => onTolerance(v[0])}
              disabled={locked}
              aria-label={m.bg.tolerance}
            />
            <Button type="button" variant="secondary" className="w-full" onClick={() => void editor.removeBg(tolerance)} disabled={locked}>
              {editor.busy ? <Loader2 className="animate-spin" /> : <Eraser />}
              {editor.busy ? m.bg.running : m.bg.run}
            </Button>
            <p className="text-xs leading-relaxed text-muted-foreground">{m.bg.hint}</p>
          </section>

          <Button type="button" variant="ghost" className="w-full" onClick={editor.resetAll} disabled={locked}>
            <Undo2 />
            {m.tools.reset}
          </Button>
        </TabsContent>

        {/* ---- Adjust ---- */}
        <TabsContent value="adjust" className="mt-5 space-y-5">
          {adjustmentSliders.map((s) => {
            const value = state.adjustments[s.key];
            return (
              <div key={s.key} className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <label htmlFor={`adj-${s.key}`} className="font-medium">
                    {s.label}
                  </label>
                  <span className="tabular-nums text-muted-foreground">
                    {value}
                    {s.unit}
                  </span>
                </div>
                <Slider
                  id={`adj-${s.key}`}
                  min={s.min}
                  max={s.max}
                  step={1}
                  value={[value]}
                  onValueChange={(v) => editor.setAdjustment(s.key, v[0])}
                  onValueCommit={editor.commitGesture}
                  aria-label={s.label}
                />
              </div>
            );
          })}
          <Button type="button" variant="ghost" className="w-full" onClick={editor.resetAdjustments}>
            <Undo2 />
            {m.adjust.reset}
          </Button>
        </TabsContent>

        {/* ---- Filters ---- */}
        <TabsContent value="filters" className="mt-5">
          <div className="grid grid-cols-3 gap-3">
            {FILTERS.map((f) => {
              const selected = state.filterId === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => editor.setFilter(f.id as FilterId)}
                  className="group flex flex-col items-center gap-1.5 rounded-xl p-1 text-center"
                >
                  <span
                    className={cn(
                      'block aspect-square w-full overflow-hidden rounded-lg border-2 transition-colors',
                      selected ? 'border-primary' : 'border-transparent group-hover:border-border',
                    )}
                  >
                    <img
                      src={thumb}
                      alt=""
                      draggable={false}
                      className="h-full w-full object-cover"
                      style={{ filter: opsToCss(f.ops) }}
                    />
                  </span>
                  <span className={cn('text-xs', selected ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
                    {m.filters[f.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
