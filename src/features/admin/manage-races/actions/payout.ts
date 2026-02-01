'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { bets, races, transactions, wallets } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function finalizePayout(raceId: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  const race = await db.query.races.findFirst({
    where: eq(races.id, raceId),
  });

  if (!race || race.status === 'FINALIZED') {
    throw new Error('Race already finalized or not found');
  }

  await db.transaction(async (tx) => {
    const allBets = await tx.query.bets.findMany({
      where: eq(bets.raceId, raceId),
    });

    for (const bet of allBets) {
      if (bet.status === 'HIT' || bet.status === 'REFUNDED') {
        const payout = bet.payout ?? 0;
        if (payout > 0) {
          const wallet = await tx.query.wallets.findFirst({
            where: eq(wallets.id, bet.walletId),
          });
          if (wallet) {
            await tx
              .update(wallets)
              .set({ balance: wallet.balance + payout })
              .where(eq(wallets.id, wallet.id));

            await tx.insert(transactions).values({
              walletId: wallet.id,
              type: 'PAYOUT',
              amount: payout,
              referenceId: bet.id,
            });
          }
        }
      }
    }

    await tx
      .update(races)
      .set({
        status: 'FINALIZED',
        finalizedAt: new Date(),
      })
      .where(eq(races.id, raceId));
  });

  const { raceEventEmitter, RACE_EVENTS } = await import('@/lib/sse/event-emitter');
  raceEventEmitter.emit(RACE_EVENTS.RACE_BROADCAST, { raceId, timestamp: Date.now() });

  revalidatePath('/admin/races');
  revalidatePath(`/admin/races/${raceId}`);
  revalidatePath(`/races/${raceId}`);
  revalidatePath(`/races/${raceId}/standby`);
  revalidatePath('/mypage');

  return { success: true };
}

export async function getPayoutResults(raceId: string) {
  const { payoutResults: payoutResultsTable } = await import('@/shared/db/schema');
  return db.select().from(payoutResultsTable).where(eq(payoutResultsTable.raceId, raceId));
}
