import { CreateRaceDialog, RaceList } from '@/features/admin/manage-races';
import { Card } from '@/shared/ui';
import { Suspense } from 'react';

export default function RacesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">レース管理</h1>
        <p className="mt-1 text-sm text-gray-500">レースの登録・管理を行います</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between px-2">
          <h2 className="text-xl font-black text-gray-900">登録済みのレース</h2>
          <CreateRaceDialog />
        </div>

        <Suspense fallback={<Card className="py-12 text-center text-gray-500">読み込み中...</Card>}>
          <RaceList />
        </Suspense>
      </div>
    </div>
  );
}
