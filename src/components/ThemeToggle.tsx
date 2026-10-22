/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { useTheme } from '@/theme/ThemeProvider';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/I18nProvider';

/** Cycles system -> light -> dark. Shows the icon of the theme you would get next. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { m } = useI18n();

  const current = theme;
  const next = current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system';
  const label = next === 'light' ? m.nav.themeLight : next === 'dark' ? m.nav.themeDark : m.nav.themeSystem;
  const Icon = current === 'light' ? Sun : current === 'dark' ? Moon : Monitor;

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(next)} aria-label={label} title={label}>
      <Icon />
    </Button>
  );
}
