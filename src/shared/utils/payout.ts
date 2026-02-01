import { BET_TYPES, BetDetail } from '@/types/betting';

export const TOKUBARAI_RATE = 0.7;

export interface Finisher {
  horseNumber: number;
  bracketNumber: number;
}

/**
 * 票が的中しているか判定する
 * @param detail 購入内容
 * @param finishers 着順（1着、2着、3着...の順）
 */
export function isWinningBet(detail: BetDetail, finishers: Finisher[]): boolean {
  const { type, selections } = detail;
  const f1 = finishers[0];
  const f2 = finishers[1];
  const f3 = finishers[2];

  if (!f1) return false;

  switch (type) {
    case BET_TYPES.WIN:
      return selections[0] === f1.horseNumber;

    case BET_TYPES.PLACE:
      return finishers.slice(0, 3).some((f) => f.horseNumber === selections[0]);

    case BET_TYPES.QUINELLA:
      return (
        f2 &&
        ((selections[0] === f1.horseNumber && selections[1] === f2.horseNumber) ||
          (selections[0] === f2.horseNumber && selections[1] === f1.horseNumber))
      );

    case BET_TYPES.EXACTA:
      return f2 && selections[0] === f1.horseNumber && selections[1] === f2.horseNumber;

    case BET_TYPES.WIDE: {
      if (!f2) return false;
      const top3 = finishers.slice(0, 3).map((f) => f.horseNumber);
      return selections.every((s) => top3.includes(s));
    }

    case BET_TYPES.BRACKET_QUINELLA:
      return (
        f2 &&
        ((selections[0] === f1.bracketNumber && selections[1] === f2.bracketNumber) ||
          (selections[0] === f2.bracketNumber && selections[1] === f1.bracketNumber))
      );

    case BET_TYPES.TRIO: {
      if (!f2 || !f3) return false;
      const top3 = finishers.slice(0, 3).map((f) => f.horseNumber);
      return selections.every((s) => top3.includes(s));
    }

    case BET_TYPES.TRIFECTA:
      return (
        f2 &&
        f3 &&
        selections[0] === f1.horseNumber &&
        selections[1] === f2.horseNumber &&
        selections[2] === f3.horseNumber
      );

    default:
      return false;
  }
}

/**
 * 配当（オッズ）を計算する（パリミュチュエル方式）
 * @param totalPool その券種の総賭け金
 * @param winningAmount その的中馬番号（または組み合わせ）の的中金額
 * @param totalWinningAmount その券種全体の総的中金額（複勝などの分割用）
 * @param winningCount 的中した種類数（複勝なら通常3）
 * @param takeoutRate 控除率（0.0 〜 1.0）
 * @returns 払い戻し倍率（10円単位で切り捨てた倍率）
 */
export function calculatePayoutRate(
  totalPool: number,
  winningAmount: number,
  totalWinningAmount: number,
  winningCount: number = 1,
  takeoutRate: number = 0
): number {
  if (winningAmount <= 0) return 0;

  const netPool = totalPool * (1 - takeoutRate);

  let payoutPerUnit: number;

  if (winningCount > 1) {
    const profit = Math.max(0, netPool - totalWinningAmount);
    const dividedProfit = profit / winningCount;
    payoutPerUnit = (winningAmount + dividedProfit) / winningAmount;
  } else {
    payoutPerUnit = netPool / winningAmount;
  }

  const rate = Math.floor(payoutPerUnit * 10) / 10;
  return Math.max(1.0, rate);
}
