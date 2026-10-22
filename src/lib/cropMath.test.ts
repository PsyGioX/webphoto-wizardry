/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { fitAspect, moveRect, resizeRect, type Handle, type Rect } from './cropMath';

const W = 1000;
const H = 600;
const inside = (r: Rect) =>
  r.x >= -1e-6 && r.y >= -1e-6 && r.x + r.width <= W + 1e-6 && r.y + r.height <= H + 1e-6;

describe('cropMath', () => {
  it('fits an aspect ratio inside the image and centers it', () => {
    const r = fitAspect(1, W, H);
    expect(r.width).toBeCloseTo(600);
    expect(r.height).toBeCloseTo(600);
    expect(r.x).toBeCloseTo(200);
    expect(fitAspect(null, W, H)).toEqual({ x: 0, y: 0, width: W, height: H });
  });

  it('never moves a rectangle outside the image', () => {
    const r = moveRect({ x: 100, y: 100, width: 300, height: 200 }, 5000, -5000, W, H);
    expect(r).toEqual({ x: 700, y: 0, width: 300, height: 200 });
  });

  it('resizes freely and respects the minimum size', () => {
    const start = { x: 100, y: 100, width: 300, height: 200 };
    const grown = resizeRect(start, 'se', 100, 50, W, H, null);
    expect(grown).toEqual({ x: 100, y: 100, width: 400, height: 250 });
    const squashed = resizeRect(start, 'e', -5000, 0, W, H, null);
    expect(squashed.width).toBe(24);
  });

  const handles: Handle[] = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'];
  it.each(handles)('keeps the aspect ratio and stays inside bounds for handle %s', (handle) => {
    const start = { x: 300, y: 150, width: 400, height: 300 };
    const aspect = 4 / 3;
    for (const [dx, dy] of [[80, 40], [-120, -90], [2000, 2000], [-2000, -2000], [0, 0]]) {
      const r = resizeRect(start, handle, dx, dy, W, H, aspect);
      expect(inside(r)).toBe(true);
      expect(r.width / r.height).toBeCloseTo(aspect, 5);
      expect(r.width).toBeGreaterThan(0);
    }
  });
});
