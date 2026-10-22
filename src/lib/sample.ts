/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { createCanvas, get2d } from './imageOps';

/** Generates a small landscape so people can try the editor without a photo of their own. */
export function createSampleCanvas(width = 1600, height = 1000): HTMLCanvasElement {
  const canvas = createCanvas(width, height);
  const ctx = get2d(canvas);

  const sky = ctx.createLinearGradient(0, 0, 0, height * 0.72);
  sky.addColorStop(0, '#2b1b5e');
  sky.addColorStop(0.45, '#7b4bd1');
  sky.addColorStop(0.8, '#f08a6a');
  sky.addColorStop(1, '#ffc46b');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // Stars
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for (let i = 0; i < 70; i++) {
    const x = ((i * 7919) % 1000) / 1000 * width;
    const y = ((i * 104729) % 1000) / 1000 * height * 0.4;
    ctx.globalAlpha = 0.35 + ((i * 31) % 10) / 20;
    ctx.fillRect(x, y, 2 + (i % 3), 2 + (i % 3));
  }
  ctx.globalAlpha = 1;

  // Sun
  const sunX = width * 0.68;
  const sunY = height * 0.58;
  const glow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, height * 0.4);
  glow.addColorStop(0, 'rgba(255,236,170,0.95)');
  glow.addColorStop(0.25, 'rgba(255,190,110,0.5)');
  glow.addColorStop(1, 'rgba(255,190,110,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#fff2c4';
  ctx.beginPath();
  ctx.arc(sunX, sunY, height * 0.065, 0, Math.PI * 2);
  ctx.fill();

  const ridge = (base: number, amp: number, seed: number, colour: string) => {
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width; x += 8) {
      const t = x / width;
      const y =
        base * height -
        amp * height * (0.55 * Math.sin(t * 5 + seed) + 0.3 * Math.sin(t * 11 + seed * 2) + 0.15 * Math.sin(t * 23 + seed * 3));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
  };

  ridge(0.72, 0.14, 1.2, '#8a4fb0');
  ridge(0.8, 0.12, 3.1, '#5a3a98');
  ridge(0.9, 0.09, 5.4, '#2d2166');
  ridge(1.0, 0.07, 7.7, '#161038');
  return canvas;
}
