/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { applyOpsToPixels, opsToCss, type FilterOp } from './filters';
import type { Rect } from './cropMath';

/** Keeps canvases within what mobile browsers (notably iOS Safari) can handle. */
export const MAX_PIXELS = 16_000_000;
/** Browsers fail on canvases wider or taller than this (Chrome 32,767, Safari 16,384). */
export const MAX_SIDE = 16_384;
/** Refuse absurdly large inputs before decoding them, so a bad file cannot freeze or crash the tab. */
export const MAX_FILE_BYTES = 80 * 1024 * 1024;
/** Decoded-size ceiling (about 190 megapixels). Larger images are rejected instead of drawn. */
export const MAX_DECODED_PIXELS = 190_000_000;

export type Rotation = 0 | 90 | 180 | 270;
export type ExportFormat = 'png' | 'jpeg' | 'webp';

export interface Transform {
  rotation: Rotation;
  flipH: boolean;
  flipV: boolean;
}

export const MIME: Record<ExportFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

export const EXTENSION: Record<ExportFormat, string> = {
  png: 'png',
  jpeg: 'jpg',
  webp: 'webp',
};

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

export function get2d(canvas: HTMLCanvasElement, willReadFrequently = false): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d', { willReadFrequently });
  if (!ctx) throw new Error('Canvas 2D is not available');
  return ctx;
}

export class ImageRejectedError extends Error {
  constructor(readonly reason: 'too-large' | 'invalid') {
    super(reason);
  }
}

export async function loadImage(file: Blob): Promise<HTMLImageElement> {
  if (file.size > MAX_FILE_BYTES) throw new ImageRejectedError('too-large');
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    // 0 x 0 happens for SVGs without intrinsic size; huge sizes are decompression bombs.
    if (!w || !h) throw new ImageRejectedError('invalid');
    if (w * h > MAX_DECODED_PIXELS) throw new ImageRejectedError('too-large');
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Draws an image to a canvas, scaling it down when it exceeds `maxPixels`. */
export function imageToCanvas(
  img: CanvasImageSource & { width: number; height: number },
  maxPixels = MAX_PIXELS,
): { canvas: HTMLCanvasElement; scaled: boolean } {
  const w = (img as HTMLImageElement).naturalWidth || img.width;
  const h = (img as HTMLImageElement).naturalHeight || img.height;
  const factor = Math.min(1, Math.sqrt(maxPixels / (w * h)));
  const canvas = createCanvas(w * factor, h * factor);
  const ctx = get2d(canvas);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return { canvas, scaled: factor < 1 };
}

export const transformedSize = (base: { width: number; height: number }, rotation: Rotation) =>
  rotation % 180 === 0
    ? { width: base.width, height: base.height }
    : { width: base.height, height: base.width };

/** Draws `base` onto `target`, resizing the target to fit the rotated result. */
export function drawTransformed(target: HTMLCanvasElement, base: HTMLCanvasElement, t: Transform): void {
  const { width, height } = transformedSize(base, t.rotation);
  if (target.width !== width) target.width = width;
  if (target.height !== height) target.height = height;
  const ctx = get2d(target);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.translate(width / 2, height / 2);
  ctx.rotate((t.rotation * Math.PI) / 180);
  ctx.scale(t.flipH ? -1 : 1, t.flipV ? -1 : 1);
  ctx.drawImage(base, -base.width / 2, -base.height / 2);
}

export function transformCanvas(base: HTMLCanvasElement, t: Transform): HTMLCanvasElement {
  const out = createCanvas(1, 1);
  drawTransformed(out, base, t);
  return out;
}

export function cropCanvas(src: HTMLCanvasElement, rect: Rect): HTMLCanvasElement {
  const out = createCanvas(rect.width, rect.height);
  get2d(out).drawImage(src, rect.x, rect.y, rect.width, rect.height, 0, 0, out.width, out.height);
  return out;
}

/** Resizes in halving steps when shrinking a lot, which keeps edges clean. */
export function resizeCanvas(src: HTMLCanvasElement, width: number, height: number): HTMLCanvasElement {
  let current = src;
  let w = src.width;
  let h = src.height;
  while (w / 2 >= width && h / 2 >= height) {
    w = Math.floor(w / 2);
    h = Math.floor(h / 2);
    const step = createCanvas(w, h);
    const sctx = get2d(step);
    sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(current, 0, 0, w, h);
    current = step;
  }
  const out = createCanvas(width, height);
  const ctx = get2d(out);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(current, 0, 0, out.width, out.height);
  return out;
}

let filterSupport: boolean | undefined;
export function supportsCanvasFilter(): boolean {
  if (filterSupport === undefined) {
    filterSupport = typeof CanvasRenderingContext2D !== 'undefined' && 'filter' in CanvasRenderingContext2D.prototype;
  }
  return filterSupport;
}

/** Bakes the filter ops into a new canvas. Optionally flattens transparency onto white (for JPEG). */
export function applyFilters(src: HTMLCanvasElement, ops: FilterOp[], flattenOnWhite = false): HTMLCanvasElement {
  const out = createCanvas(src.width, src.height);
  const ctx = get2d(out, !supportsCanvasFilter());
  if (ops.length > 0 && supportsCanvasFilter()) {
    ctx.filter = opsToCss(ops);
    ctx.drawImage(src, 0, 0);
    ctx.filter = 'none';
  } else {
    ctx.drawImage(src, 0, 0);
    if (ops.length > 0) {
      const data = ctx.getImageData(0, 0, out.width, out.height);
      applyOpsToPixels(data.data, ops);
      ctx.putImageData(data, 0, 0);
    }
  }
  if (flattenOnWhite) {
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.globalCompositeOperation = 'source-over';
  }
  return out;
}

export function canvasToBlob(canvas: HTMLCanvasElement, format: ExportFormat, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Export failed'));
        // Browsers silently fall back to PNG for unsupported types (e.g. WebP on old Safari).
        if (blob.type !== MIME[format]) return reject(new Error(`${format} is not supported here`));
        resolve(blob);
      },
      MIME[format],
      format === 'png' ? undefined : quality,
    );
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function baseName(filename: string): string {
  const name = filename.replace(/\.[^./\\]+$/, '').trim();
  return name || 'photo';
}

const RESERVED_WINDOWS_NAMES = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

/** Makes a safe file name: no path separators, control characters, leading dots or reserved Windows names. */
export function sanitizeFilename(name: string): string {
  const cleaned = name
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/^[.\s-]+/, '')
    .replace(/[.\s]+$/, '')
    .slice(0, 120);
  if (!cleaned || RESERVED_WINDOWS_NAMES.test(cleaned)) return 'photo';
  return cleaned;
}
