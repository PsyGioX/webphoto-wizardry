/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { ImageRejectedError, MAX_FILE_BYTES, loadImage, sanitizeFilename } from './imageOps';

describe('input hardening', () => {
  it('neutralises path traversal and special characters in file names', () => {
    expect(sanitizeFilename('../../etc/passwd')).toBe('etc-passwd');
    expect(sanitizeFilename('..\\win\\sys:tem*?.png')).toBe('win-sys-tem-.png');
    expect(sanitizeFilename('a\u0000b\u001fc')).toBe('a-b-c');
  });

  it('falls back to a safe default for empty and reserved Windows names', () => {
    expect(sanitizeFilename('CON')).toBe('photo');
    expect(sanitizeFilename('nul')).toBe('photo');
    expect(sanitizeFilename('   ...  ')).toBe('photo');
    expect(sanitizeFilename('')).toBe('photo');
  });

  it('limits the length of file names', () => {
    expect(sanitizeFilename('x'.repeat(500)).length).toBe(120);
  });

  it('rejects oversized files before decoding them', async () => {
    const huge = { size: MAX_FILE_BYTES + 1, type: 'image/png' } as Blob;
    await expect(loadImage(huge)).rejects.toBeInstanceOf(ImageRejectedError);
  });
});
