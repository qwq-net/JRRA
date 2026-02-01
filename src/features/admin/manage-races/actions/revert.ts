'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { payoutResults, raceEntries, races } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * 着順設定をリセットし、未入力状態に戻す
 * (払い戻し実行前のみ使用可能)
 */
export async function resetRaceResults(raceId: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  const race = await db.query.races.findFirst({
    where: eq(races.id, raceId),
  });

  if (!race) throw new Error('Race not found');
  if (race.status === 'FINALIZED') {
    throw new Error('確定済みのレースはリセットできません');
  }

  await db.transaction(async (tx) => {
    // 1. 各馬の着順をクリア
    await tx.update(raceEntries).set({ finishPosition: null }).where(eq(raceEntries.raceId, raceId));

    // 2. 配当結果を削除
    await tx.delete(payoutResults).where(eq(payoutResults.raceId, raceId));

    // 3. レースステータス（もしCLOSEDなら）はそのまま維持されるが、
    // 着順管理画面側で結果がなければ再入力可能になる
  });

  revalidatePath('/admin/races');
  revalidatePath(`/admin/races/${raceId}`);
  revalidatePath(`/races/${raceId}`);

  return { success: true };
}
