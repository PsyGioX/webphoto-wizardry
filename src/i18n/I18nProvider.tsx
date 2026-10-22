/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { messages, type Lang, type Messages } from './translations';

const STORAGE_KEY = 'photowizard-lang';

interface I18nValue {
  lang: Lang;
  m: Messages;
  toggleLang: () => void;
}

const I18nContext = createContext<I18nValue | null>(null);

function detectLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'ru') return stored;
  } catch {
    /* storage can be blocked */
  }
  const prefs = typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : [];
  return prefs.some((l) => l?.toLowerCase().startsWith('ru')) ? 'ru' : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(detectLang);
  const m = messages[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = m.meta.title;
    document
      .querySelectorAll('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]')
      .forEach((el) => el.setAttribute('content', m.meta.description));
    document
      .querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]')
      .forEach((el) => el.setAttribute('content', m.meta.title));
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    ogLocale?.setAttribute('content', lang === 'ru' ? 'ru_RU' : 'en_US');
  }, [lang, m]);

  const toggleLang = useCallback(() => {
    setLang((current) => {
      const next: Lang = current === 'en' ? 'ru' : 'en';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ lang, m, toggleLang }), [lang, m, toggleLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
