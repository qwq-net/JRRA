'use client';

import { createEvent } from '../actions';

export function CreateEventForm() {
  return (
    <form action={createEvent} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">イベント名</label>
        <input name="name" required className="w-full rounded-md border px-3 py-2" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">説明 (任意)</label>
        <textarea name="description" className="w-full rounded-md border px-3 py-2" rows={3} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">配布金額 (初期資金)</label>
        <input
          name="distributeAmount"
          type="number"
          required
          defaultValue={100000}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">開催日</label>
        <input
          name="date"
          type="date"
          required
          defaultValue={new Date().toISOString().split('T')[0]}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <button type="submit" className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
        イベント作成
      </button>
    </form>
  );
}
