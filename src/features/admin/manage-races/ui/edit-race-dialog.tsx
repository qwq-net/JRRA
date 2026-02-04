'use client';

import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { RaceForm } from './race-form';

interface EditRaceDialogProps {
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
    closingAt?: Date | string | null;
  };
  events: Array<{ id: string; name: string; date: string }>;
}

export function EditRaceDialog({ race, events }: EditRaceDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="mr-2 text-gray-400 hover:text-blue-600" title="編集">
          <Pencil size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>レース情報の編集</DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <RaceForm events={events} initialData={race} onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
