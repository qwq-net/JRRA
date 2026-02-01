'use client';

import { Button, Input } from '@/shared/ui';
import { toJSTString } from '@/shared/utils/date';
import * as Dialog from '@radix-ui/react-dialog';
import { Clock, Loader2, X } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { updateRace } from '../actions';

interface EditClosingAtDialogProps {
  race: {
    id: string;
    eventId: string;
    date: string;
    location: string;
    name: string;
    raceNumber?: number | null;
    distance: number;
    surface: '芝' | 'ダート';
    condition: '良' | '稍重' | '重' | '不良' | null;
    closingAt: Date | null;
  };
  trigger: React.ReactNode;
}

export function EditClosingAtDialog({ race, trigger }: EditClosingAtDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [closingAt, setClosingAt] = useState(toJSTString(race.closingAt));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('eventId', race.eventId);
    formData.append('date', race.date);
    formData.append('location', race.location);
    formData.append('name', race.name);
    if (race.raceNumber) formData.append('raceNumber', race.raceNumber.toString());
    formData.append('distance', race.distance.toString());
    formData.append('surface', race.surface);
    formData.append('condition', race.condition || '');
    formData.append('closingAt', closingAt);

    startTransition(async () => {
      try {
        await updateRace(race.id, formData);
        toast.success('受付終了時刻を更新しました');
        setOpen(false);
      } catch {
        toast.error('更新に失敗しました');
      }
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="animate-in fade-in fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="animate-in zoom-in-95 fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold text-gray-900">受付終了時刻の変更</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 transition-colors hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">受付終了予定</label>
              <div className="relative">
                <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="datetime-local"
                  value={closingAt}
                  onChange={(e) => setClosingAt(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                未来の時刻に設定すると、ステータスが自動的に「受付中」に戻ります。
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <Button variant="ghost" type="button" disabled={isPending}>
                  キャンセル
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={isPending} className="font-bold">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    更新中...
                  </>
                ) : (
                  '更新する'
                )}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
