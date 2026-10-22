/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Download, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useI18n } from '@/i18n/I18nProvider';
import { downloadBlob, EXTENSION, sanitizeFilename, type ExportFormat } from '@/lib/imageOps';
import type { ImageEditor } from '@/hooks/useImageEditor';
import { cn } from '@/lib/utils';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editor: ImageEditor;
}

const FORMATS: { id: ExportFormat; label: string }[] = [
  { id: 'png', label: 'PNG' },
  { id: 'jpeg', label: 'JPEG' },
  { id: 'webp', label: 'WebP' },
];

function webpSupported(): boolean {
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    return c.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
}

export function ExportDialog({ open, onOpenChange, editor }: ExportDialogProps) {
  const { m } = useI18n();
  const [working, setWorking] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(next) => !working && onOpenChange(next)}>
      <DialogContent closeLabel={m.common.close} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{m.export.title}</DialogTitle>
          <DialogDescription>{m.export.description}</DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so the file name resets for every export. */}
        <ExportForm editor={editor} working={working} onWorking={setWorking} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function ExportForm({
  editor,
  working,
  onWorking,
  onClose,
}: {
  editor: ImageEditor;
  working: boolean;
  onWorking: (working: boolean) => void;
  onClose: () => void;
}) {
  const { m } = useI18n();
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState(92);
  const [name, setName] = useState(() => `${editor.fileName}-edited`);
  const hasWebp = useMemo(() => webpSupported(), []);

  const download = async () => {
    onWorking(true);
    try {
      const blob = await editor.exportBlob(format, quality / 100);
      const filename = `${sanitizeFilename(name)}.${EXTENSION[format]}`;
      downloadBlob(blob, filename);
      toast.success(m.toast.exported(filename));
      onClose();
    } catch (error) {
      const unsupported = error instanceof Error && /not supported/i.test(error.message);
      toast.error(unsupported ? m.toast.formatUnsupported : m.toast.exportFail);
    } finally {
      onWorking(false);
    }
  };

  const hints: Record<ExportFormat, string> = { png: m.export.png, jpeg: m.export.jpeg, webp: m.export.webp };

  return (
    <form
      className="grid gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        void download();
      }}
    >
      <div className="space-y-2">
        <p id="export-format-label" className="text-sm font-medium">
          {m.export.format}
        </p>
        <div role="radiogroup" aria-labelledby="export-format-label" className="grid grid-cols-3 gap-2">
          {FORMATS.map((f) => {
            const disabled = f.id === 'webp' && !hasWebp;
            const selected = format === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={disabled}
                onClick={() => setFormat(f.id)}
                className={cn(
                  'h-11 rounded-lg border text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                  selected ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:bg-accent',
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground">{hints[format]}</p>
      </div>

      {format !== 'png' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <Label htmlFor="export-quality">{m.export.quality}</Label>
            <span className="tabular-nums text-muted-foreground">{quality}%</span>
          </div>
          <Slider
            id="export-quality"
            min={40}
            max={100}
            step={1}
            value={[quality]}
            onValueChange={(v) => setQuality(v[0])}
            aria-label={m.export.quality}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="export-name">{m.export.filename}</Label>
        <div className="flex items-center gap-2">
          <Input id="export-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
          <span className="text-sm text-muted-foreground">.{EXTENSION[format]}</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {m.export.size}: {editor.size.width} × {editor.size.height} px
      </p>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={onClose} disabled={working}>
          {m.common.cancel}
        </Button>
        <Button type="submit" disabled={working || !name.trim()}>
          {working ? <Loader2 className="animate-spin" /> : <Download />}
          {working ? m.export.working : m.export.download}
        </Button>
      </DialogFooter>
    </form>
  );
}
