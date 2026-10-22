/**
 * PhotoWizard
 * © 2026 PsyGioX (https://github.com/PsyGioX). All rights reserved.
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useI18n } from '@/i18n/I18nProvider';

interface ResizeDialogProps {
  open: boolean;
  width: number;
  height: number;
  onOpenChange: (open: boolean) => void;
  /** Returns true when the resize was applied. */
  onApply: (width: number, height: number) => boolean;
}

const QUICK = [25, 50, 75, 200];

export function ResizeDialog({ open, width, height, onOpenChange, onApply }: ResizeDialogProps) {
  const { m } = useI18n();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={m.common.close} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{m.resize.title}</DialogTitle>
          <DialogDescription>{m.resize.description}</DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so the fields start from the current size every time. */}
        <ResizeForm width={width} height={height} onClose={() => onOpenChange(false)} onApply={onApply} />
      </DialogContent>
    </Dialog>
  );
}

function ResizeForm({
  width,
  height,
  onClose,
  onApply,
}: {
  width: number;
  height: number;
  onClose: () => void;
  onApply: (width: number, height: number) => boolean;
}) {
  const { m } = useI18n();
  const [w, setW] = useState(width);
  const [h, setH] = useState(height);
  const [keep, setKeep] = useState(true);
  const ratio = width / height;
  const parse = (value: string) => Math.max(0, Math.min(99999, parseInt(value.replace(/\D/g, ''), 10) || 0));

  const changeW = (value: string) => {
    const next = parse(value);
    setW(next);
    if (keep && next > 0) setH(Math.max(1, Math.round(next / ratio)));
  };
  const changeH = (value: string) => {
    const next = parse(value);
    setH(next);
    if (keep && next > 0) setW(Math.max(1, Math.round(next * ratio)));
  };
  const scale = (percent: number) => {
    setW(Math.max(1, Math.round((width * percent) / 100)));
    setH(Math.max(1, Math.round((height * percent) / 100)));
  };

  const valid = w >= 1 && h >= 1;
  const submit = () => {
    if (valid && onApply(w, h)) onClose();
  };

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="resize-width">{m.resize.width}</Label>
          <Input id="resize-width" inputMode="numeric" value={w || ''} onChange={(e) => changeW(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="resize-height">{m.resize.height}</Label>
          <Input id="resize-height" inputMode="numeric" value={h || ''} onChange={(e) => changeH(e.target.value)} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch id="resize-keep" checked={keep} onCheckedChange={setKeep} />
        <Label htmlFor="resize-keep">{m.resize.keep}</Label>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">{m.resize.quick}</p>
        <div className="flex flex-wrap gap-2">
          {QUICK.map((p) => (
            <Button key={p} type="button" size="sm" variant="outline" onClick={() => scale(p)}>
              {p}%
            </Button>
          ))}
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={onClose}>
          {m.common.cancel}
        </Button>
        <Button type="submit" disabled={!valid}>
          {m.common.apply}
        </Button>
      </DialogFooter>
    </form>
  );
}
