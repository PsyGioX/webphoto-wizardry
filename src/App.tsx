/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { ThemeProvider } from '@/theme/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { I18nProvider } from '@/i18n/I18nProvider';
import Index from '@/pages/Index';

const App = () => (
  <ThemeProvider>
    <I18nProvider>
      <TooltipProvider>
        <Toaster position="bottom-center" closeButton />
        <Index />
      </TooltipProvider>
    </I18nProvider>
  </ThemeProvider>
);

export default App;
