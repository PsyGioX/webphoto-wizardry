/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { createCanvas, get2d } from './imageOps';

export interface RemoveBackgroundResult {
  canvas: HTMLCanvasElement;
  /** Share of the picture that was made transparent, 0..1. */
  removed: number;
}

const WORK_SIDE = 1280;

/**
 * Colour-key background removal that runs fully in the browser.
 *
 * 1. Finds the dominant colours along the picture's border (up to three).
 * 2. Flood-fills inwards from the border through pixels close to those colours.
 * 3. Drops tiny leftover specks, feathers the edge and applies the mask at full resolution.
 *
 * It works best on plain or studio backgrounds. It is not a semantic cut-out.
 */
export function removeBackground(source: HTMLCanvasElement, tolerance: number): RemoveBackgroundResult {
  const scale = Math.min(1, WORK_SIDE / Math.max(source.width, source.height));
  const w = Math.max(1, Math.round(source.width * scale));
  const h = Math.max(1, Math.round(source.height * scale));

  const work = createCanvas(w, h);
  const wctx = get2d(work, true);
  wctx.drawImage(source, 0, 0, w, h);
  const px = wctx.getImageData(0, 0, w, h).data;

  const refs = dominantBorderColours(px, w, h);
  if (refs.length === 0) return { canvas: copyCanvas(source), removed: 0 };

  const tol2 = tolerance * tolerance;
  const isBg = (i: number): boolean => {
    const o = i * 4;
    if (px[o + 3] < 8) return true;
    for (const c of refs) {
      const dr = px[o] - c[0];
      const dg = px[o + 1] - c[1];
      const db = px[o + 2] - c[2];
      if (dr * dr + dg * dg + db * db <= tol2) return true;
    }
    return false;
  };

  // Flood fill (4-connected) from every matching border pixel.
  const bg = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  let sp = 0;
  const push = (i: number) => {
    if (!bg[i] && isBg(i)) {
      bg[i] = 1;
      stack[sp++] = i;
    }
  };
  for (let x = 0; x < w; x++) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    push(y * w);
    push(y * w + w - 1);
  }
  while (sp > 0) {
    const i = stack[--sp];
    const x = i % w;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (i >= w) push(i - w);
    if (i < w * (h - 1)) push(i + w);
  }

  removeSpecks(bg, w, h, Math.max(24, Math.round(w * h * 0.0004)));

  let removedCount = 0;
  const alpha = new Float32Array(w * h);
  for (let i = 0; i < alpha.length; i++) {
    if (bg[i]) removedCount++;
    alpha[i] = bg[i] ? 0 : 1;
  }
  const removed = removedCount / (w * h);

  // Feather the edge with a 3x3 box blur.
  const soft = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w) continue;
          sum += alpha[yy * w + xx];
          n++;
        }
      }
      soft[(y * w + x) * 4 + 3] = Math.round((sum / n) * 255);
    }
  }
  const maskSmall = createCanvas(w, h);
  get2d(maskSmall).putImageData(new ImageData(soft, w, h), 0, 0);

  // Scale the mask up and keep only the source pixels it covers.
  const out = createCanvas(source.width, source.height);
  const octx = get2d(out);
  octx.imageSmoothingEnabled = true;
  octx.imageSmoothingQuality = 'high';
  octx.drawImage(maskSmall, 0, 0, out.width, out.height);
  octx.globalCompositeOperation = 'source-in';
  octx.drawImage(source, 0, 0);
  octx.globalCompositeOperation = 'source-over';

  return { canvas: out, removed };
}

function copyCanvas(src: HTMLCanvasElement): HTMLCanvasElement {
  const out = createCanvas(src.width, src.height);
  get2d(out).drawImage(src, 0, 0);
  return out;
}

/** Up to three dominant colours (4-bit buckets) found around the image border. */
export function dominantBorderColours(px: Uint8ClampedArray, w: number, h: number): number[][] {
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  let total = 0;
  const add = (x: number, y: number) => {
    const o = (y * w + x) * 4;
    if (px[o + 3] < 8) return;
    const key = ((px[o] >> 4) << 8) | ((px[o + 1] >> 4) << 4) | (px[o + 2] >> 4);
    const e = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    e.n++;
    e.r += px[o];
    e.g += px[o + 1];
    e.b += px[o + 2];
    buckets.set(key, e);
    total++;
  };
  for (let x = 0; x < w; x++) {
    add(x, 0);
    add(x, h - 1);
  }
  for (let y = 1; y < h - 1; y++) {
    add(0, y);
    add(w - 1, y);
  }
  if (total === 0) return [];

  const ranked = [...buckets.values()].sort((a, b) => b.n - a.n);
  const colours: number[][] = [];
  for (const e of ranked) {
    if (colours.length >= 3 || e.n < total * 0.05) break;
    const c = [e.r / e.n, e.g / e.n, e.b / e.n];
    const near = colours.some((k) => (k[0] - c[0]) ** 2 + (k[1] - c[1]) ** 2 + (k[2] - c[2]) ** 2 < 28 * 28);
    if (!near) colours.push(c);
  }
  return colours;
}

/** Turns small isolated foreground islands (noise) back into background. */
function removeSpecks(bg: Uint8Array, w: number, h: number, minArea: number): void {
  const seen = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  const members = new Int32Array(w * h);
  for (let start = 0; start < bg.length; start++) {
    if (bg[start] || seen[start]) continue;
    let sp = 0;
    let count = 0;
    seen[start] = 1;
    stack[sp++] = start;
    while (sp > 0) {
      const i = stack[--sp];
      members[count++] = i;
      const x = i % w;
      const visit = (j: number) => {
        if (!bg[j] && !seen[j]) {
          seen[j] = 1;
          stack[sp++] = j;
        }
      };
      if (x > 0) visit(i - 1);
      if (x < w - 1) visit(i + 1);
      if (i >= w) visit(i - w);
      if (i < w * (h - 1)) visit(i + w);
    }
    if (count < minArea) for (let k = 0; k < count; k++) bg[members[k]] = 1;
  }
}
