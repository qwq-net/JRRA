'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { EventForm } from './event-form';

export function CreateEventDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 font-semibold shadow-sm transition-all hover:shadow-md active:scale-95">
          <Plus className="h-4 w-4" />
          新規イベント作成
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新規イベント作成</DialogTitle>
          <DialogDescription>新しいイベントの基本情報を入力してください。</DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <EventForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
