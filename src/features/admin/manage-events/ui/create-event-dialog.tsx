'use client';

import { Button } from '@/shared/ui';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { EventForm } from './event-form';

export function CreateEventDialog() {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <Button className="flex items-center gap-2 font-bold shadow-sm transition-all hover:shadow-md active:scale-95">
          <Plus className="h-4 w-4" />
          新規イベント作成
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="animate-in fade-in fixed inset-0 z-50 bg-black/50 backdrop-blur-sm duration-200" />
        <AlertDialog.Content className="animate-in zoom-in-95 fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-8 shadow-2xl duration-200">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <AlertDialog.Title className="text-2xl font-black text-gray-900">新規イベント作成</AlertDialog.Title>
              <AlertDialog.Description className="mt-1 text-sm text-gray-500">
                新しいイベントの基本情報を入力してください。
              </AlertDialog.Description>
            </div>
            <AlertDialog.Cancel asChild>
              <button className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <span className="sr-only">閉じる</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </AlertDialog.Cancel>
          </div>

          <div className="mt-2">
            <EventForm onSuccess={() => setOpen(false)} />
          </div>

          <div className="mt-8 flex justify-center">
            <AlertDialog.Cancel asChild>
              <button className="text-sm font-bold text-gray-400 transition-colors hover:text-gray-600">
                キャンセル
              </button>
            </AlertDialog.Cancel>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
