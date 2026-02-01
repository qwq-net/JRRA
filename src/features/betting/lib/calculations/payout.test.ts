import { calculatePayoutRate } from '@/shared/utils/payout';
import { describe, expect, it } from 'vitest';

describe('calculatePayoutRate (払戻金計算)', () => {
  describe('通常計算 (単勝・馬連など)', () => {
    it('控除なしの場合: 1000円プール / 200円的中 = 5.0倍', () => {
      const rate = calculatePayoutRate(1000, 200, 200, 1, 0);
      expect(rate).toBe(5.0);
    });

    it('控除20%の場合: 1000円プール (純計800円) / 200円的中 = 4.0倍', () => {
      const rate = calculatePayoutRate(1000, 200, 200, 1, 0.2);
      expect(rate).toBe(4.0);
    });

    it('10円単位切り捨ての確認: 1000円 / 300円 = 3.333... -> 3.3倍', () => {
      const rate = calculatePayoutRate(1000, 300, 300, 1, 0);
      expect(rate).toBe(3.3);
    });

    it('1.0倍保証（元返し）: 1000円プール / 1200円的中 = 0.83... -> 1.0倍', () => {
      const rate = calculatePayoutRate(1000, 1200, 1200, 1, 0);
      expect(rate).toBe(1.0);
    });
  });

  describe('分割計算 (複勝・ワイドなど)', () => {
    it('複勝の基本: 1000円プール, 的中馬A(100円)とB(100円), 控除20%', () => {
      // 純計 = 800円
      // 利益 = 800 - (100+100) = 600円
      // Aの取り分 = 100 + (600 / 2) = 400円 -> 4.0倍
      const rateA = calculatePayoutRate(1000, 100, 200, 2, 0.2);
      expect(rateA).toBe(4.0);
    });

    it('複勝の按分違い: A(100円), B(300円), 控除なし', () => {
      // 純計 = 1000円
      // 利益 = 1000 - (100+300) = 600円
      // Aの倍率: (100 + 300) / 100 = 4.0倍
      // Bの倍率: (300 + 300) / 300 = 2.0倍
      const rateA = calculatePayoutRate(1000, 100, 400, 2, 0);
      const rateB = calculatePayoutRate(1000, 300, 400, 2, 0);
      expect(rateA).toBe(4.0);
      expect(rateB).toBe(2.0);
    });
  });
});
