/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { Github } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';

export const REPO_URL = 'https://github.com/PsyGioX/webphoto-wizardry';
export const AUTHOR_URL = 'https://github.com/PsyGioX';

export function Footer() {
  const { m } = useI18n();
  return (
    <footer className="border-t pb-[env(safe-area-inset-bottom)] text-sm text-muted-foreground">
      <div className="container flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()}{' '}
          <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer author" className="font-medium text-foreground underline-offset-4 hover:underline">
            PsyGioX
          </a>
          . {m.footer.rights} {m.footer.privacy}
        </p>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 underline-offset-4 hover:text-foreground hover:underline"
        >
          <Github className="h-4 w-4" aria-hidden="true" />
          {m.footer.source}
        </a>
      </div>
    </footer>
  );
}
