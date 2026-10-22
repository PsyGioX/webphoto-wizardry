/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { useI18n } from '@/i18n/I18nProvider';
import {
  applyFilters,
  baseName,
  canvasToBlob,
  cropCanvas,
  imageToCanvas,
  loadImage,
  resizeCanvas,
  transformCanvas,
  transformedSize,
  MAX_PIXELS,
  MAX_SIDE,
  ImageRejectedError,
  type ExportFormat,
  type Rotation,
} from '@/lib/imageOps';
import { buildOps, DEFAULT_ADJUSTMENTS, type Adjustments, type FilterId } from '@/lib/filters';
import { removeBackground } from '@/lib/removeBackground';
import { createSampleCanvas } from '@/lib/sample';
import type { Rect } from '@/lib/cropMath';

export interface EditState {
  base: HTMLCanvasElement;
  rotation: Rotation;
  flipH: boolean;
  flipV: boolean;
  adjustments: Adjustments;
  filterId: FilterId;
}

interface History {
  past: EditState[];
  present: EditState | null;
  future: EditState[];
}

const MAX_STEPS = 25;
/** Total pixels of distinct base canvases kept in undo history (about 320 MB of RGBA). */
const HISTORY_PIXEL_BUDGET = 80_000_000;

function trim(history: History): History {
  let { past } = history;
  if (past.length > MAX_STEPS) past = past.slice(past.length - MAX_STEPS);
  const pixelCost = (list: EditState[]) => {
    const seen = new Set<HTMLCanvasElement>();
    let total = 0;
    for (const s of list) {
      if (!seen.has(s.base)) {
        seen.add(s.base);
        total += s.base.width * s.base.height;
      }
    }
    return total;
  };
  const all = () => [...past, ...(history.present ? [history.present] : []), ...history.future];
  while (past.length > 1 && pixelCost(all()) > HISTORY_PIXEL_BUDGET) past = past.slice(1);
  return { ...history, past };
}

/** Holds the undo history outside React state so event handlers always see the latest value. */
class EditorStore {
  history: History = { past: [], present: null, future: [] };
  original: EditState | null = null;
  /** State at the start of the current slider drag, so the whole drag becomes one undo step. */
  gesture: EditState | null = null;
  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.history;

  setGesture(state: EditState | null) {
    this.gesture = state;
  }

  setOriginal(state: EditState | null) {
    this.original = state;
  }

  set(next: History) {
    this.history = next;
    this.listeners.forEach((l) => l());
  }
}

const nextFrame = () => new Promise<void>((resolve) => setTimeout(resolve, 30));

export function useImageEditor() {
  const { m } = useI18n();
  const [store] = useState(() => new EditorStore());
  const history = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState('photo');

  const set = (next: History) => store.set(next);

  /** Records the current state in history, then moves to `next`. */
  const commit = (next: EditState) => {
    const { present, past } = store.history;
    store.setGesture(null);
    set(trim({ past: present ? [...past, present] : past, present: next, future: [] }));
  };

  const present = history.present;

  const open = (base: HTMLCanvasElement, name: string) => {
    const initial: EditState = {
      base,
      rotation: 0,
      flipH: false,
      flipV: false,
      adjustments: { ...DEFAULT_ADJUSTMENTS },
      filterId: 'normal',
    };
    store.setOriginal(initial);
    store.setGesture(null);
    setFileName(name);
    set({ past: [], present: initial, future: [] });
  };

  const loadBlob = useCallback(
    async (file: Blob, name: string) => {
      if (!file.type.startsWith('image/')) {
        toast.error(m.toast.notImage);
        return;
      }
      setBusy(true);
      try {
        const img = await loadImage(file);
        const { canvas, scaled } = imageToCanvas(img);
        open(canvas, baseName(name));
        toast.success(m.toast.loaded);
        if (scaled) toast.info(m.toast.downscaled(canvas.width, canvas.height));
      } catch (error) {
        toast.error(error instanceof ImageRejectedError && error.reason === 'too-large' ? m.toast.tooLarge : m.toast.loadFail);
      } finally {
        setBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [m],
  );

  const loadFile = useCallback((file: File) => loadBlob(file, file.name), [loadBlob]);

  const loadSample = useCallback(() => {
    open(createSampleCanvas(), 'sample');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Non-destructive edits -------------------------------------------------

  const setAdjustment = (key: keyof Adjustments, value: number) => {
    const h = store.history;
    if (!h.present) return;
    if (!store.gesture) store.setGesture(h.present);
    set({ ...h, present: { ...h.present, adjustments: { ...h.present.adjustments, [key]: value } } });
  };

  /** Call when a slider drag ends so the whole drag becomes one undo step. */
  const commitGesture = () => {
    const h = store.history;
    const start = store.gesture;
    store.setGesture(null);
    if (!start || !h.present || start === h.present) return;
    set(trim({ past: [...h.past, start], present: h.present, future: [] }));
  };

  const resetAdjustments = () => {
    if (!present) return;
    commit({ ...present, adjustments: { ...DEFAULT_ADJUSTMENTS } });
  };

  const setFilter = (filterId: FilterId) => {
    if (!present || present.filterId === filterId) return;
    commit({ ...present, filterId });
  };

  const rotate = (direction: 'left' | 'right') => {
    if (!present) return;
    const delta = direction === 'right' ? 90 : 270;
    commit({ ...present, rotation: ((present.rotation + delta) % 360) as Rotation });
  };

  /** Flips what the user sees, even after a quarter turn. */
  const flip = (axis: 'h' | 'v') => {
    if (!present) return;
    const sideways = present.rotation % 180 !== 0;
    const useH = sideways ? axis === 'v' : axis === 'h';
    commit(useH ? { ...present, flipH: !present.flipH } : { ...present, flipV: !present.flipV });
  };

  // --- Destructive edits (bake the transform into a new base canvas) ---------

  const bake = (s: EditState) => transformCanvas(s.base, s);
  const rebased = (s: EditState, base: HTMLCanvasElement): EditState => ({
    ...s,
    base,
    rotation: 0,
    flipH: false,
    flipV: false,
  });

  const applyCrop = (rect: Rect) => {
    if (!present) return;
    const cropped = cropCanvas(bake(present), rect);
    commit(rebased(present, cropped));
    toast.success(m.toast.cropped(cropped.width, cropped.height));
  };

  const resize = (width: number, height: number): boolean => {
    if (!present) return false;
    if (width > MAX_SIDE || height > MAX_SIDE || width * height > MAX_PIXELS) {
      toast.error(m.resize.limit(Math.round(MAX_PIXELS / 1_000_000), MAX_SIDE));
      return false;
    }
    const resized = resizeCanvas(bake(present), width, height);
    commit(rebased(present, resized));
    toast.success(m.toast.resized(resized.width, resized.height));
    return true;
  };

  const removeBg = async (tolerance: number) => {
    if (!present || busy) return;
    setBusy(true);
    await nextFrame();
    try {
      const { canvas, removed } = removeBackground(bake(present), tolerance);
      if (removed < 0.01) {
        toast.info(m.toast.bgNothing);
      } else if (removed > 0.98) {
        toast.warning(m.toast.bgTooMuch);
      } else {
        commit(rebased(present, canvas));
        toast.success(m.toast.bgDone(Math.round(removed * 100)));
      }
    } catch {
      toast.error(m.toast.bgFail);
    } finally {
      setBusy(false);
    }
  };

  const resetAll = () => {
    if (!present || !store.original) return;
    commit({ ...store.original, adjustments: { ...DEFAULT_ADJUSTMENTS }, filterId: 'normal' });
  };

  // --- History ----------------------------------------------------------------

  const undo = () => {
    const h = store.history;
    if (h.past.length === 0 || !h.present) return;
    store.setGesture(null);
    set({ past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] });
  };

  const redo = () => {
    const h = store.history;
    if (h.future.length === 0 || !h.present) return;
    store.setGesture(null);
    set({ past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) });
  };

  // --- Export -----------------------------------------------------------------

  const exportBlob = async (format: ExportFormat, quality: number): Promise<Blob> => {
    if (!present) throw new Error('No image');
    await nextFrame();
    const transformed = bake(present);
    const finished = applyFilters(transformed, buildOps(present.adjustments, present.filterId), format === 'jpeg');
    return canvasToBlob(finished, format, quality);
  };

  const size = useMemo(
    () => (present ? transformedSize(present.base, present.rotation) : { width: 0, height: 0 }),
    [present],
  );

  return {
    state: present,
    hasImage: present !== null,
    fileName,
    size,
    busy,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    loadFile,
    loadBlob,
    loadSample,
    setAdjustment,
    commitGesture,
    resetAdjustments,
    setFilter,
    rotate,
    flip,
    applyCrop,
    resize,
    removeBg,
    resetAll,
    undo,
    redo,
    exportBlob,
  };
}

export type ImageEditor = ReturnType<typeof useImageEditor>;
