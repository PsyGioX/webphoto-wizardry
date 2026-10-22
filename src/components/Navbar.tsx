/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { Download, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useI18n } from '@/i18n/I18nProvider';

interface NavbarProps {
  hasImage: boolean;
  busy: boolean;
  onOpen: () => void;
  onExport: () => void;
  onHome: () => void;
}

export function Navbar({ hasImage, busy, onOpen, onExport, onHome }: NavbarProps) {
  const { m } = useI18n();
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between gap-2">
        <a
          href="/"
          onClick={(e) => {
            if (hasImage) {
              e.preventDefault();
              onHome();
            }
          }}
          className="flex items-center gap-2.5 rounded-md"
          aria-label={m.nav.home}
        >
          <Logo className="h-8 w-8" />
          <span className="hidden font-display text-base min-[420px]:inline">PhotoWizard</span>
        </a>

        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageToggle />
          <ThemeToggle />
          {hasImage && (
            <>
              <Button variant="outline" onClick={onOpen} className="px-3" aria-label={m.nav.open}>
                <ImagePlus />
                <span className="hidden sm:inline">{m.nav.open}</span>
              </Button>
              <Button onClick={onExport} disabled={busy} className="px-3 sm:px-4">
                <Download />
                {m.nav.export}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
