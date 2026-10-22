/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { Crop, Smartphone, ShieldCheck, SlidersHorizontal, Undo2, Wand2, type LucideIcon } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import type { FeatureIcon } from '@/i18n/translations';

const ICONS: Record<FeatureIcon, LucideIcon> = {
  shield: ShieldCheck,
  crop: Crop,
  wand: Wand2,
  sliders: SlidersHorizontal,
  undo: Undo2,
  smartphone: Smartphone,
};

/** Crawlable copy below the hero: features, steps and FAQ. Mirrors the FAQ JSON-LD in index.html. */
export function SeoContent() {
  const { m } = useI18n();
  const { content } = m;
  return (
    <div className="border-t bg-card/50">
      <div className="container space-y-16 py-14 sm:py-20">
        <section aria-labelledby="features-title">
          <h2 id="features-title" className="font-display text-2xl sm:text-3xl">
            {content.featuresTitle}
          </h2>
          <ul className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {content.features.map((f) => {
              const Icon = ICONS[f.icon];
              return (
                <li key={f.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{f.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="steps-title">
          <h2 id="steps-title" className="font-display text-2xl sm:text-3xl">
            {content.stepsTitle}
          </h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {content.steps.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="font-display text-4xl leading-none text-primary" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="faq-title" className="max-w-3xl">
          <h2 id="faq-title" className="font-display text-2xl sm:text-3xl">
            {content.faqTitle}
          </h2>
          <div className="mt-6 divide-y border-y">
            {content.faq.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="text-xl leading-none text-primary transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
