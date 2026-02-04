'use client';

import { Badge, Button } from '@/shared/ui';
import { useTransition } from 'react';
import { updateEventStatus } from '../actions';
import { EditEventDialog } from './edit-event-dialog';

type Event = {
  id: string;
  name: string;
  description: string | null;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED';
  distributeAmount: number;
  date: string;
};

export function EventList({ events }: { events: Event[] }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (eventId: string, newStatus: Event['status']) => {
    startTransition(async () => {
      await updateEventStatus(eventId, newStatus);
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full min-w-[800px] border-collapse">
        <thead className="bg-gray-50">
          <tr className="border-b border-gray-100">
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              ステータス
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              イベント名
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              配布金額
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              開催日
            </th>
            <th className="w-48 px-6 py-4 text-right text-sm font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {events.map((event) => (
            <tr key={event.id} className="transition-colors hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge label={event.status} variant="status" />
              </td>
              <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap text-gray-900" title={event.name}>
                {event.name}
              </td>
              <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap text-gray-600">
                {event.distributeAmount.toLocaleString()} 円
              </td>
              <td className="px-6 py-4 text-sm font-semibold whitespace-nowrap text-gray-400">{event.date}</td>
              <td className="px-6 py-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-2">
                  <EditEventDialog event={event} />
                  {event.status === 'SCHEDULED' && (
                    <Button
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleStatusChange(event.id, 'ACTIVE')}
                      className="bg-green-600 font-semibold text-white hover:bg-green-700"
                    >
                      Start
                    </Button>
                  )}
                  {event.status === 'ACTIVE' && (
                    <>
                      <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleStatusChange(event.id, 'SCHEDULED')}
                        className="bg-amber-500 font-semibold text-white hover:bg-amber-600"
                      >
                        Pause
                      </Button>
                      <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleStatusChange(event.id, 'COMPLETED')}
                        variant="destructive"
                      >
                        End
                      </Button>
                    </>
                  )}
                  {event.status === 'COMPLETED' && (
                    <Button
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleStatusChange(event.id, 'ACTIVE')}
                      className="bg-gray-500 font-semibold text-white hover:bg-gray-600"
                    >
                      Re-Open
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {events.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-gray-400">
                表示できるイベントがありません
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
