'use client';

import { BET_TYPES, BetType } from '@/types/betting';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface ResultItem {
  type: BetType;
  combinations: {
    numbers: number[]; // [1, 2] etc.
    payout: number;
    popularity?: number; // 人気順（あれば）
  }[];
}

interface PayoutResultModalProps {
  raceName: string;
  raceDate: string; // "東京 11R" etc.
  results: ResultItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_COLORS: Record<BetType, string> = {
  [BET_TYPES.WIN]: 'bg-blue-800 text-white',
  [BET_TYPES.PLACE]: 'bg-red-600 text-white',
  [BET_TYPES.BRACKET_QUINELLA]: 'bg-green-700 text-white',
  [BET_TYPES.QUINELLA]: 'bg-purple-800 text-white',
  [BET_TYPES.WIDE]: 'bg-cyan-600 text-white',
  [BET_TYPES.EXACTA]: 'bg-yellow-500 text-black',
  [BET_TYPES.TRIO]: 'bg-blue-600 text-white',
  [BET_TYPES.TRIFECTA]: 'bg-amber-700 text-white',
};

const TYPE_LABELS: Record<BetType, string> = {
  [BET_TYPES.WIN]: '単 勝',
  [BET_TYPES.PLACE]: '複 勝',
  [BET_TYPES.BRACKET_QUINELLA]: '枠 連',
  [BET_TYPES.QUINELLA]: '馬 連',
  [BET_TYPES.WIDE]: 'ワイド',
  [BET_TYPES.EXACTA]: '馬 単',
  [BET_TYPES.TRIO]: '3連複',
  [BET_TYPES.TRIFECTA]: '3連単',
};

export function PayoutResultModal({ raceName, raceDate, results, open, onOpenChange }: PayoutResultModalProps) {
  // グリッドレイアウト用にデータを整形
  // 左カラム: 単勝, 複勝, 馬連, 馬単, 3連複, 3連単
  // 右カラム: 枠連, ワイド (画像レイアウトを参考に配置)

  // 簡易的に全リストを表示するスタイルにする（レスポンシブ考慮）

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="animate-in fade-in fixed inset-0 z-50 bg-black/80 duration-300" />
        <Dialog.Content className="animate-in zoom-in-95 fixed top-[50%] left-[50%] z-50 w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-md border border-gray-700 bg-black shadow-2xl duration-300">
          {/* Header */}
          <div className="flex items-center justify-between bg-linear-to-b from-blue-900 to-blue-950 px-6 py-3 text-white">
            <div className="flex items-end gap-4">
              <Dialog.Title asChild>
                <div className="flex items-end gap-4">
                  <span className="text-xl font-bold tracking-widest">{raceDate}</span>
                  <span className="text-2xl font-black">{raceName}</span>
                </div>
              </Dialog.Title>
              <Dialog.Description className="sr-only">{raceName}の払戻金結果を表示しています。</Dialog.Description>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold tracking-widest">払戻金</span>
              <Dialog.Close asChild>
                <button className="text-gray-400 hover:text-white">
                  <X size={28} />
                </button>
              </Dialog.Close>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-px bg-gray-700 p-px md:grid-cols-2">
            {/* Left Column Types */}
            <div className="flex flex-col gap-px bg-gray-700">
              {renderResultBlock(results, BET_TYPES.WIN)}
              {renderResultBlock(results, BET_TYPES.PLACE)}
              {renderResultBlock(results, BET_TYPES.QUINELLA)}
              {renderResultBlock(results, BET_TYPES.EXACTA)}
              {renderResultBlock(results, BET_TYPES.TRIO)}
              {renderResultBlock(results, BET_TYPES.TRIFECTA)}
            </div>

            {/* Right Column Types */}
            <div className="flex h-full flex-col gap-px bg-gray-700">
              {renderResultBlock(results, BET_TYPES.BRACKET_QUINELLA)}
              {renderResultBlock(results, BET_TYPES.WIDE)}
              {/* Empty filler if needed */}
              <div className="grow bg-black"></div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function renderResultBlock(results: ResultItem[], type: BetType) {
  const item = results.find((r) => r.type === type);
  // データがなくても枠は表示する（空表示）
  const combinations = item?.combinations || [];

  // 複勝やワイドなどで複数行ある場合に対応
  // レイアウト: [ラベル(色付き)] [番号] [払戻金]

  return (
    <div className="flex min-h-12 bg-black text-white">
      {/* Label Box */}
      <div
        className={`flex w-24 shrink-0 items-center justify-center text-lg font-bold tracking-widest ${TYPE_COLORS[type]} border-r border-gray-700`}
      >
        {TYPE_LABELS[type]}
      </div>

      {/* Combinations List */}
      <div className="flex flex-1 flex-col">
        {combinations.length > 0 ? (
          combinations.map((combo, idx) => (
            <div
              key={idx}
              className="flex flex-1 items-center justify-between border-b border-gray-800 px-4 py-2 last:border-0"
            >
              <div className="font-mono text-2xl font-bold tracking-wider">{combo.numbers.join(' - ')}</div>
              <div className="w-32 text-right font-mono text-xl font-bold">{combo.payout.toLocaleString()}円</div>
            </div>
          ))
        ) : (
          <div className="flex flex-1 items-center justify-center px-4 py-2 text-gray-600">-</div>
        )}
      </div>
    </div>
  );
}
