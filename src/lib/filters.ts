/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

export type FilterFn = 'brightness' | 'contrast' | 'saturate' | 'grayscale' | 'sepia' | 'hue-rotate';

export interface FilterOp {
  fn: FilterFn;
  /** Ratio for most filters (1 = unchanged), degrees for hue-rotate. */
  value: number;
}

export interface FilterPreset {
  id: FilterId;
  ops: FilterOp[];
}

export type FilterId =
  | 'normal' | 'mono' | 'sepia' | 'vintage' | 'cool'
  | 'warm' | 'vivid' | 'drama' | 'fade' | 'noir';

export const FILTERS: FilterPreset[] = [
  { id: 'normal', ops: [] },
  { id: 'mono', ops: [{ fn: 'grayscale', value: 1 }] },
  { id: 'sepia', ops: [{ fn: 'sepia', value: 1 }] },
  {
    id: 'vintage',
    ops: [
      { fn: 'sepia', value: 0.5 },
      { fn: 'contrast', value: 1.15 },
      { fn: 'brightness', value: 0.95 },
      { fn: 'saturate', value: 1.2 },
    ],
  },
  {
    id: 'cool',
    ops: [
      { fn: 'brightness', value: 1.05 },
      { fn: 'saturate', value: 1.1 },
      { fn: 'hue-rotate', value: 12 },
    ],
  },
  {
    id: 'warm',
    ops: [
      { fn: 'sepia', value: 0.25 },
      { fn: 'saturate', value: 1.3 },
      { fn: 'brightness', value: 1.05 },
      { fn: 'hue-rotate', value: -8 },
    ],
  },
  {
    id: 'vivid',
    ops: [
      { fn: 'saturate', value: 1.5 },
      { fn: 'contrast', value: 1.1 },
    ],
  },
  {
    id: 'drama',
    ops: [
      { fn: 'contrast', value: 1.3 },
      { fn: 'brightness', value: 0.92 },
      { fn: 'saturate', value: 1.1 },
    ],
  },
  {
    id: 'fade',
    ops: [
      { fn: 'contrast', value: 0.85 },
      { fn: 'brightness', value: 1.1 },
      { fn: 'saturate', value: 0.8 },
    ],
  },
  {
    id: 'noir',
    ops: [
      { fn: 'grayscale', value: 1 },
      { fn: 'contrast', value: 1.35 },
      { fn: 'brightness', value: 0.9 },
    ],
  },
];

export interface Adjustments {
  brightness: number; // percent, 100 = unchanged
  contrast: number; // percent
  saturation: number; // percent
  hue: number; // degrees, 0 = unchanged
}

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
};

export const getPreset = (id: string): FilterPreset =>
  FILTERS.find((f) => f.id === id) ?? FILTERS[0];

/** Adjustments first, then the preset, so presets stack on top of manual edits. */
export function buildOps(adjustments: Adjustments, filterId: string): FilterOp[] {
  const ops: FilterOp[] = [];
  if (adjustments.brightness !== 100) ops.push({ fn: 'brightness', value: adjustments.brightness / 100 });
  if (adjustments.contrast !== 100) ops.push({ fn: 'contrast', value: adjustments.contrast / 100 });
  if (adjustments.saturation !== 100) ops.push({ fn: 'saturate', value: adjustments.saturation / 100 });
  if (adjustments.hue !== 0) ops.push({ fn: 'hue-rotate', value: adjustments.hue });
  return ops.concat(getPreset(filterId).ops);
}

/** CSS / canvas `filter` string. Returns "none" for an empty op list. */
export function opsToCss(ops: FilterOp[]): string {
  if (ops.length === 0) return 'none';
  return ops
    .map((op) => (op.fn === 'hue-rotate' ? `hue-rotate(${op.value}deg)` : `${op.fn}(${op.value})`))
    .join(' ');
}

export function hasEffect(adjustments: Adjustments, filterId: string): boolean {
  return buildOps(adjustments, filterId).length > 0;
}

// ---------------------------------------------------------------------------
// Pixel fallback for browsers whose canvas has no `ctx.filter` (Safari).
// Matrices follow the Filter Effects specification.
// ---------------------------------------------------------------------------

export interface Affine {
  /** Row-major 3x3 matrix applied to [r, g, b] in 0..255. */
  m: number[];
  /** Offset added after the matrix, 0..255 scale. */
  o: number[];
}

const IDENTITY: number[] = [1, 0, 0, 0, 1, 0, 0, 0, 1];

export function opToAffine(op: FilterOp): Affine {
  const v = op.value;
  switch (op.fn) {
    case 'brightness':
      return { m: [v, 0, 0, 0, v, 0, 0, 0, v], o: [0, 0, 0] };
    case 'contrast': {
      const off = 255 * (0.5 - 0.5 * v);
      return { m: [v, 0, 0, 0, v, 0, 0, 0, v], o: [off, off, off] };
    }
    case 'saturate':
      return {
        m: [
          0.213 + 0.787 * v, 0.715 - 0.715 * v, 0.072 - 0.072 * v,
          0.213 - 0.213 * v, 0.715 + 0.285 * v, 0.072 - 0.072 * v,
          0.213 - 0.213 * v, 0.715 - 0.715 * v, 0.072 + 0.928 * v,
        ],
        o: [0, 0, 0],
      };
    case 'grayscale': {
      const a = 1 - Math.min(1, Math.max(0, v));
      return {
        m: [
          0.2126 + 0.7874 * a, 0.7152 - 0.7152 * a, 0.0722 - 0.0722 * a,
          0.2126 - 0.2126 * a, 0.7152 + 0.2848 * a, 0.0722 - 0.0722 * a,
          0.2126 - 0.2126 * a, 0.7152 - 0.7152 * a, 0.0722 + 0.9278 * a,
        ],
        o: [0, 0, 0],
      };
    }
    case 'sepia': {
      const a = 1 - Math.min(1, Math.max(0, v));
      return {
        m: [
          0.393 + 0.607 * a, 0.769 - 0.769 * a, 0.189 - 0.189 * a,
          0.349 - 0.349 * a, 0.686 + 0.314 * a, 0.168 - 0.168 * a,
          0.272 - 0.272 * a, 0.534 - 0.534 * a, 0.131 + 0.869 * a,
        ],
        o: [0, 0, 0],
      };
    }
    case 'hue-rotate': {
      const r = (v * Math.PI) / 180;
      const c = Math.cos(r);
      const s = Math.sin(r);
      return {
        m: [
          0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928,
          0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.14, 0.072 - c * 0.072 - s * 0.283,
          0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072,
        ],
        o: [0, 0, 0],
      };
    }
    default:
      return { m: IDENTITY, o: [0, 0, 0] };
  }
}

const clamp255 = (n: number) => (n < 0 ? 0 : n > 255 ? 255 : n);

/** Applies the ops in order to RGBA data, clamping after every op like CSS does. */
export function applyOpsToPixels(data: Uint8ClampedArray, ops: FilterOp[]): void {
  if (ops.length === 0) return;
  const steps = ops.map(opToAffine);
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    for (let s = 0; s < steps.length; s++) {
      const { m, o } = steps[s];
      const nr = clamp255(m[0] * r + m[1] * g + m[2] * b + o[0]);
      const ng = clamp255(m[3] * r + m[4] * g + m[5] * b + o[1]);
      const nb = clamp255(m[6] * r + m[7] * g + m[8] * b + o[2]);
      r = nr;
      g = ng;
      b = nb;
    }
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
}
