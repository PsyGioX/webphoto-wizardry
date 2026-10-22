/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { ImagePlus, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { SeoContent } from '@/components/SeoContent';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';

interface LandingProps {
  dragging: boolean;
  onChoose: () => void;
  onSample: () => void;
}

export function Landing({ dragging, onChoose, onSample }: LandingProps) {
  const { m } = useI18n();
  return (
    <>
      <section className="container grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
        <div className="animate-rise">
          <h1 className="font-display text-[clamp(1.75rem,4.4vw,3rem)] leading-[1.12] text-balance">{m.hero.title}</h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">{m.hero.subtitle}</p>
          <p className="mt-6 flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            {m.hero.privacy}
          </p>
        </div>

        <div
          className={cn(
            'animate-rise rounded-3xl border-2 border-dashed bg-card p-6 text-center shadow-xs transition-colors [animation-delay:120ms] sm:p-10',
            dragging ? 'border-primary bg-accent' : 'border-primary/35',
          )}
        >
          <Logo className="mx-auto h-24 w-24 sm:h-28 sm:w-28" animated />
          <h2 className="mt-6 font-display text-xl">{dragging ? m.drop.release : m.drop.title}</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">{m.drop.hint}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={onChoose} aria-label={m.drop.aria}>
              <ImagePlus />
              {m.drop.choose}
            </Button>
            <Button size="lg" variant="secondary" onClick={onSample}>
              <Sparkles />
              {m.drop.sample}
            </Button>
          </div>
        </div>
      </section>

      <SeoContent />
    </>
  );
}
