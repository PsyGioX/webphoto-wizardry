/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { useRef, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Landing } from '@/components/Landing';
import { EditorWorkspace } from '@/components/EditorWorkspace';
import { ExportDialog } from '@/components/ExportDialog';
import { useImageEditor } from '@/hooks/useImageEditor';
import { useFileIntake } from '@/hooks/useFileIntake';
import { useI18n } from '@/i18n/I18nProvider';

const Index = () => {
  const { m } = useI18n();
  const editor = useImageEditor();
  const inputRef = useRef<HTMLInputElement>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const dragging = useFileIntake(editor.loadFile);

  const choose = () => inputRef.current?.click();

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {m.nav.skip}
      </a>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void editor.loadFile(file);
          e.target.value = ''; // allow choosing the same file again
        }}
      />

      <Navbar
        hasImage={editor.hasImage}
        busy={editor.busy}
        onOpen={choose}
        onExport={() => setExportOpen(true)}
        onHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      <main id="main" className="flex-1">
        {editor.hasImage ? (
          <EditorWorkspace editor={editor} />
        ) : (
          <Landing dragging={dragging} onChoose={choose} onSample={editor.loadSample} />
        )}
      </main>

      {editor.hasImage && dragging && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-primary/15 backdrop-blur-[2px]">
          <p className="rounded-2xl border-2 border-dashed border-primary bg-card px-8 py-6 font-display text-lg shadow-lg">
            {m.drop.release}
          </p>
        </div>
      )}

      <Footer />

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} editor={editor} />
    </div>
  );
};

export default Index;
