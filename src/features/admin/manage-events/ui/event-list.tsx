'use client';

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
            <th className="px-6 py-4 text-left text-sm font-black tracking-wider whitespace-nowrap text-gray-400 uppercase">
              ステータス
            </th>
            <th className="px-6 py-4 text-left text-sm font-black tracking-wider whitespace-nowrap text-gray-400 uppercase">
              イベント名
            </th>
            <th className="px-6 py-4 text-left text-sm font-black tracking-wider whitespace-nowrap text-gray-400 uppercase">
              配布金額
            </th>
            <th className="px-6 py-4 text-left text-sm font-black tracking-wider whitespace-nowrap text-gray-400 uppercase">
              開催日
            </th>
            <th className="w-48 px-6 py-4 text-right text-sm font-black tracking-wider whitespace-nowrap text-gray-400 uppercase">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {events.map((event) => (
            <tr key={event.id} className="transition-colors hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-sm font-black ${
                    event.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : event.status === 'COMPLETED'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {event.status === 'ACTIVE' ? '公開中' : event.status === 'COMPLETED' ? '終了済み' : '準備中'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-black whitespace-nowrap text-gray-900" title={event.name}>
                {event.name}
              </td>
              <td className="px-6 py-4 text-sm font-bold whitespace-nowrap text-gray-600">
                {event.distributeAmount.toLocaleString()} 円
              </td>
              <td className="px-6 py-4 text-sm font-bold whitespace-nowrap text-gray-400">{event.date}</td>
              <td className="px-6 py-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-2">
                  <EditEventDialog event={event} />
                  {event.status === 'SCHEDULED' && (
                    <button
                      disabled={isPending}
                      onClick={() => handleStatusChange(event.id, 'ACTIVE')}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md active:scale-95 disabled:opacity-50"
                    >
                      Start
                    </button>
                  )}
                  {event.status === 'ACTIVE' && (
                    <>
                      <button
                        disabled={isPending}
                        onClick={() => handleStatusChange(event.id, 'SCHEDULED')}
                        className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-amber-600 hover:shadow-md active:scale-95 disabled:opacity-50"
                      >
                        Pause
                      </button>
                      <button
                        disabled={isPending}
                        onClick={() => handleStatusChange(event.id, 'COMPLETED')}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md active:scale-95 disabled:opacity-50"
                      >
                        End
                      </button>
                    </>
                  )}
                  {event.status === 'COMPLETED' && (
                    <button
                      disabled={isPending}
                      onClick={() => handleStatusChange(event.id, 'ACTIVE')}
                      className="rounded-lg bg-gray-500 px-3 py-1.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-gray-600 hover:shadow-md active:scale-95 disabled:opacity-50"
                    >
                      Re-Open
                    </button>
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
