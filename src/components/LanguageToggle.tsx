/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/I18nProvider';

export function LanguageToggle() {
  const { lang, m, toggleLang } = useI18n();
  const target = lang === 'en' ? 'RU' : 'EN';
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLang}
      aria-label={`${m.nav.language}: ${target}`}
      title={`${m.nav.language}: ${target}`}
      className="text-xs font-semibold"
    >
      {target}
    </Button>
  );
}
