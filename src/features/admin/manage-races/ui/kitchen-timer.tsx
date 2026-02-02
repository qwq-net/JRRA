'use client';

import { Button } from '@/shared/ui';
import { Clock, Timer, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { closeRace, setClosingTime } from '../actions/update';

interface KitchenTimerProps {
  raceId: string;
  initialClosingAt: Date | null;
  status: string;
}

export function KitchenTimer({ raceId, initialClosingAt, status }: KitchenTimerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [closingAt, setClosingAt] = useState<Date | null>(initialClosingAt);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    setClosingAt(initialClosingAt);
  }, [initialClosingAt]);

  const handleAutoClose = useCallback(async () => {
    try {
      await closeRace(raceId);
      toast.success('タイマーによりレースを締め切りました');
    } catch (error) {
      console.error('Failed to auto-close race', error);
    }
  }, [raceId]);

  useEffect(() => {
    if (!closingAt || status !== 'SCHEDULED') {
      setTimeLeft(null);
      return;
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, closingAt.getTime() - now);
      setTimeLeft(diff);

      if (diff === 0) {
        clearInterval(timer);
        handleAutoClose();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [closingAt, status, handleAutoClose]);

  const handleSetTimer = async (minutes: number) => {
    try {
      const result = await setClosingTime(raceId, minutes);
      if (result.success) {
        setClosingAt(new Date(result.closingAt));
        toast.success(`${minutes}分後の締切を設定しました`);
      }
    } catch {
      toast.error('タイマーの設定に失敗しました');
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status !== 'SCHEDULED') return null;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
          timeLeft && timeLeft > 0
            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Clock className="h-3 w-3" />
        {timeLeft && timeLeft > 0 ? formatTime(timeLeft) : 'タイマー'}
      </button>

      {isOpen && (
        <div className="animate-in fade-in slide-in-from-bottom-2 absolute right-0 bottom-full z-50 mb-2 min-w-[200px] rounded-lg border border-gray-200 bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
              <Timer className="text-primary h-4 w-4" />
              キッチンタイマー
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[1, 5, 10, 15, 30, 60].map((mins) => (
              <Button
                key={mins}
                variant="outline"
                size="sm"
                className="h-8 text-xs font-bold"
                onClick={() => handleSetTimer(mins)}
              >
                +{mins}分
              </Button>
            ))}
          </div>

          <div className="mt-3 border-t border-gray-100 pt-2 text-center">
            <p className="text-[10px] leading-tight text-gray-400">
              設定すると締切時刻が上書きされます。
              <br />
              0になると自動的に締切処理が走ります。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
