/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  applyOpsToPixels,
  buildOps,
  DEFAULT_ADJUSTMENTS,
  opsToCss,
  hasEffect,
} from './filters';

const run = (rgba: number[], ops: Parameters<typeof applyOpsToPixels>[1]) => {
  const data = new Uint8ClampedArray(rgba);
  applyOpsToPixels(data, ops);
  return Array.from(data);
};

describe('filters', () => {
  it('builds no ops and a "none" filter for untouched settings', () => {
    expect(buildOps(DEFAULT_ADJUSTMENTS, 'normal')).toEqual([]);
    expect(opsToCss([])).toBe('none');
    expect(hasEffect(DEFAULT_ADJUSTMENTS, 'normal')).toBe(false);
  });

  it('serialises real CSS filter functions', () => {
    const ops = buildOps({ ...DEFAULT_ADJUSTMENTS, brightness: 120, hue: 30 }, 'mono');
    expect(opsToCss(ops)).toBe('brightness(1.2) hue-rotate(30deg) grayscale(1)');
  });

  it('matches CSS grayscale for pure red (luminance 0.2126)', () => {
    const [r, g, b, a] = run([255, 0, 0, 255], [{ fn: 'grayscale', value: 1 }]);
    expect(r).toBe(g);
    expect(g).toBe(b);
    expect(r).toBeCloseTo(54, -1);
    expect(a).toBe(255);
  });

  it('brightness scales and clamps', () => {
    expect(run([100, 200, 50, 255], [{ fn: 'brightness', value: 2 }])).toEqual([200, 255, 100, 255]);
  });

  it('contrast 0 collapses to mid grey', () => {
    expect(run([10, 240, 90, 255], [{ fn: 'contrast', value: 0 }])).toEqual([128, 128, 128, 255]);
  });

  it('identity-like ops leave pixels unchanged', () => {
    const px = [12, 34, 56, 200];
    expect(run(px, [{ fn: 'saturate', value: 1 }, { fn: 'hue-rotate', value: 0 }, { fn: 'sepia', value: 0 }])).toEqual(px);
  });
});
