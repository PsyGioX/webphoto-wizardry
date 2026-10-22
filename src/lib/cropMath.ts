/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropRatio {
  id: string;
  label?: string;
  value: number | null;
}

export type Handle = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

export const MIN_CROP = 24;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

export function moveRect(start: Rect, dx: number, dy: number, W: number, H: number): Rect {
  return {
    ...start,
    x: clamp(start.x + dx, 0, W - start.width),
    y: clamp(start.y + dy, 0, H - start.height),
  };
}

/** Largest centered rectangle with the given aspect ratio (null = full image). */
export function fitAspect(aspect: number | null, W: number, H: number): Rect {
  if (aspect == null) return { x: 0, y: 0, width: W, height: H };
  let width = Math.min(W, H * aspect);
  let height = width / aspect;
  if (height > H) {
    height = H;
    width = height * aspect;
  }
  return { x: (W - width) / 2, y: (H - height) / 2, width, height };
}

/**
 * Resizes `start` by dragging `handle` by (dx, dy) in image pixels.
 * With `aspect` set the ratio is kept; the rectangle always stays inside W x H.
 */
export function resizeRect(
  start: Rect,
  handle: Handle,
  dx: number,
  dy: number,
  W: number,
  H: number,
  aspect: number | null,
  min = MIN_CROP,
): Rect {
  const hx = handle.includes('w') ? -1 : handle.includes('e') ? 1 : 0;
  const hy = handle.includes('n') ? -1 : handle.includes('s') ? 1 : 0;
  const right = start.x + start.width;
  const bottom = start.y + start.height;

  if (aspect == null) {
    let l = start.x;
    let r = right;
    let t = start.y;
    let b = bottom;
    if (hx < 0) l = clamp(l + dx, 0, r - min);
    if (hx > 0) r = clamp(r + dx, l + min, W);
    if (hy < 0) t = clamp(t + dy, 0, b - min);
    if (hy > 0) b = clamp(b + dy, t + min, H);
    return { x: l, y: t, width: r - l, height: b - t };
  }

  const minW = Math.max(min, min * aspect);
  const ax = hx < 0 ? right : start.x; // anchored x edge (for hx = 0, start.x)
  const ay = hy < 0 ? bottom : start.y;
  const cx = start.x + start.width / 2;
  const cy = start.y + start.height / 2;
  let w: number;

  if (hx !== 0 && hy !== 0) {
    // Corner: follow whichever axis moved more, relative to the start size.
    const sw = (start.width + hx * dx) / start.width;
    const sh = (start.height + hy * dy) / start.height;
    w = start.width * Math.max(sw, sh);
    const maxW = Math.min(hx < 0 ? ax : W - ax, (hy < 0 ? ay : H - ay) * aspect);
    w = clamp(w, minW, Math.max(minW, maxW));
    const h = w / aspect;
    return { x: hx < 0 ? ax - w : ax, y: hy < 0 ? ay - h : ay, width: w, height: h };
  }

  if (hx !== 0) {
    // Left / right edge: height follows width around the vertical center.
    w = start.width + hx * dx;
    const maxW = Math.min(hx < 0 ? ax : W - ax, 2 * Math.min(cy, H - cy) * aspect);
    w = clamp(w, minW, Math.max(minW, maxW));
    const h = w / aspect;
    return { x: hx < 0 ? ax - w : ax, y: cy - h / 2, width: w, height: h };
  }

  // Top / bottom edge: width follows height around the horizontal center.
  let h = start.height + hy * dy;
  const maxH = Math.min(hy < 0 ? ay : H - ay, (2 * Math.min(cx, W - cx)) / aspect);
  h = clamp(h, minW / aspect, Math.max(minW / aspect, maxH));
  w = h * aspect;
  return { x: cx - w / 2, y: hy < 0 ? ay - h : ay, width: w, height: h };
}

export const roundRect = (r: Rect): Rect => ({
  x: Math.round(r.x),
  y: Math.round(r.y),
  width: Math.max(1, Math.round(r.width)),
  height: Math.max(1, Math.round(r.height)),
});

export const CROP_RATIOS: CropRatio[] = [
  { id: 'free', value: null },
  { id: '1:1', label: '1:1', value: 1 },
  { id: '4:3', label: '4:3', value: 4 / 3 },
  { id: '3:2', label: '3:2', value: 3 / 2 },
  { id: '16:9', label: '16:9', value: 16 / 9 },
  { id: '3:4', label: '3:4', value: 3 / 4 },
  { id: '9:16', label: '9:16', value: 9 / 16 },
];
