'use server';

import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { bets, raceEntries, races } from '@/shared/db/schema';
import { calculatePayoutRate, Finisher, isWinningBet } from '@/shared/utils/payout';
import { BetDetail } from '@/types/betting';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function finalizeRace(
  raceId: string,
  results: { entryId: string; finishPosition: number }[],
  options: { payoutMode: 'TOTAL_DISTRIBUTION' | 'MANUAL'; takeoutRate: number } = {
    payoutMode: 'TOTAL_DISTRIBUTION',
    takeoutRate: 0,
  }
) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  await db.transaction(async (tx) => {
    for (const result of results) {
      await tx
        .update(raceEntries)
        .set({ finishPosition: result.finishPosition })
        .where(eq(raceEntries.id, result.entryId));
    }

    const raceEntriesWithInfo = await tx.query.raceEntries.findMany({
      where: eq(raceEntries.raceId, raceId),
      with: { horse: true },
      orderBy: [raceEntries.finishPosition],
    });

    const finishers: Finisher[] = raceEntriesWithInfo
      .filter((e) => e.finishPosition !== null)
      .map((e) => ({
        horseNumber: e.horseNumber!,
        bracketNumber: e.bracketNumber!,
      }));

    if (finishers.length === 0) throw new Error('No results provided');

    const allBets = await tx.query.bets.findMany({
      where: eq(bets.raceId, raceId),
    });

    const poolByBetType: Record<string, number> = {};
    const winnersByBetType: Record<string, { bet: (typeof allBets)[0]; selectionKey: string }[]> = {};
    const winningSelectionAmounts: Record<string, Record<string, number>> = {};

    for (const bet of allBets) {
      const betDetail = bet.details as BetDetail;
      const type = betDetail.type;
      poolByBetType[type] = (poolByBetType[type] || 0) + bet.amount;

      if (isWinningBet(betDetail, finishers)) {
        const selectionKey = JSON.stringify(betDetail.selections);
        if (!winnersByBetType[type]) winnersByBetType[type] = [];
        winnersByBetType[type].push({ bet, selectionKey });

        if (!winningSelectionAmounts[type]) winningSelectionAmounts[type] = {};
        winningSelectionAmounts[type][selectionKey] = (winningSelectionAmounts[type][selectionKey] || 0) + bet.amount;
      }
    }

    const takeoutRate = options.payoutMode === 'TOTAL_DISTRIBUTION' ? 0 : options.takeoutRate;
    const TOKUBARAI_RATE = 0.7;

    const payoutCalculationsByType: Record<string, { numbers: number[]; payout: number }[]> = {};

    for (const bet of allBets) {
      const betDetail = bet.details as BetDetail;
      const type = betDetail.type;
      const winners = winnersByBetType[type] || [];
      const hasWinner = winners.length > 0;

      const winnerInfo = winners.find((w) => w.bet.id === bet.id);

      let payout = 0;
      let odds = '0.0';
      let status: 'HIT' | 'LOST' | 'REFUNDED' = 'LOST';

      if (hasWinner) {
        if (winnerInfo) {
          const selectionKey = winnerInfo.selectionKey;
          const selectionAmount = winningSelectionAmounts[type][selectionKey];
          const totalWinningAmount = Object.values(winningSelectionAmounts[type]).reduce((sum, val) => sum + val, 0);
          const winningCount = Object.keys(winningSelectionAmounts[type]).length;

          const rate = calculatePayoutRate(
            poolByBetType[type],
            selectionAmount,
            totalWinningAmount,
            winningCount,
            takeoutRate
          );
          payout = Math.floor(bet.amount * rate);
          odds = rate.toFixed(1);
          status = 'HIT';

          if (!payoutCalculationsByType[type]) payoutCalculationsByType[type] = [];
          if (
            !payoutCalculationsByType[type].find(
              (p) => JSON.stringify(p.numbers) === JSON.stringify(betDetail.selections)
            )
          ) {
            const unitPayout = Math.floor(100 * rate);
            payoutCalculationsByType[type].push({ numbers: betDetail.selections, payout: unitPayout });
          }
        } else {
          payout = 0;
          odds = '0.0';
          status = 'LOST';
        }
      } else {
        if (poolByBetType[type] > 0) {
          payout = Math.floor(bet.amount * TOKUBARAI_RATE);
          odds = '0.7';
          status = 'REFUNDED';

          if (!payoutCalculationsByType[type]) payoutCalculationsByType[type] = [];
          if (payoutCalculationsByType[type].length === 0) {
            payoutCalculationsByType[type].push({ numbers: [], payout: 70 });
          }
        }
      }

      if (payout > 0) {
        await tx.update(bets).set({ status, payout, odds }).where(eq(bets.id, bet.id));
      } else {
        await tx.update(bets).set({ status: 'LOST', payout: 0 }).where(eq(bets.id, bet.id));
      }
    }

    const { payoutResults: payoutResultsTable } = await import('@/shared/db/schema');
    await tx.delete(payoutResultsTable).where(eq(payoutResultsTable.raceId, raceId));

    for (const [type, combinations] of Object.entries(payoutCalculationsByType)) {
      await tx.insert(payoutResultsTable).values({
        raceId,
        type,
        combinations,
      });
    }

    await tx
      .update(races)
      .set({
        status: 'CLOSED',
      })
      .where(eq(races.id, raceId));
  });

  revalidatePath('/admin/races');
  revalidatePath(`/admin/races/${raceId}`);
  revalidatePath(`/races/${raceId}`);
  revalidatePath(`/races/${raceId}/standby`);
  revalidatePath('/mypage');
}
