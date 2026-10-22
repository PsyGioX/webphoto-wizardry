/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  /** Gently twinkles the golden sparkle. Respects prefers-reduced-motion. */
  animated?: boolean;
}

const star = (cx: number, cy: number, R: number) => {
  const k = R * 0.16;
  return `M${cx} ${cy - R}Q${cx + k} ${cy - k} ${cx + R} ${cy}Q${cx + k} ${cy + k} ${cx} ${cy + R}Q${cx - k} ${cy + k} ${cx - R} ${cy}Q${cx - k} ${cy - k} ${cx} ${cy - R}Z`;
};

/** PhotoWizard mark: a mountain photo with a golden sparkle. Mirrors /public/logo.svg. */
export function Logo({ className, animated = false }: LogoProps) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 512 512" className={cn('shrink-0', className)} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`g${uid}`} x1="64" y1="40" x2="460" y2="480" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8A6BFF" />
          <stop offset="1" stopColor="#5230EE" />
        </linearGradient>
        <clipPath id={`c${uid}`}>
          <rect width="512" height="512" rx="116" />
        </clipPath>
      </defs>
      <g clipPath={`url(#c${uid})`}>
        <rect width="512" height="512" fill={`url(#g${uid})`} />
        <path d="M-20 430L158 206L246 318L306 244L540 500L540 540L-20 540Z" fill="#fff" />
        <path d="M206 540L352 330L540 540Z" fill="#fff" fillOpacity=".38" />
        <path
          d={star(366, 158, 92)}
          fill="#FFB020"
          className={animated ? 'animate-twinkle' : undefined}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
        <path d={star(176, 132, 32)} fill="#fff" />
      </g>
    </svg>
  );
}
