'use client';

import { getPayoutResults } from '@/features/admin/manage-races/actions';
import { PayoutResultModal } from '@/features/betting/ui/payout-result-modal';
import { BetType } from '@/types/betting';
import { AlarmClock, Loader2, WifiOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface StandbyClientProps {
  race: {
    id: string;
    name: string;
    location: string;
    date: string;
    closingAt: Date | null;
  };
  initialResults?: PayoutResult[];
  isFinalized: boolean;
}

interface PayoutResult {
  type: BetType;
  combinations: {
    numbers: number[];
    payout: number;
    popularity?: number;
  }[];
}

export function StandbyClient({ race, initialResults = [], isFinalized: initialIsFinalized }: StandbyClientProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false); // ページ表示時に自動で開かないように修正
  const [results, setResults] = useState<PayoutResult[]>(initialResults);
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'>(
    initialIsFinalized ? 'DISCONNECTED' : 'CONNECTING'
  );

  const fetchResults = useCallback(async () => {
    try {
      const data = await getPayoutResults(race.id);
      setResults(data as unknown as PayoutResult[]);
    } catch (e) {
      console.error('Failed to fetch payout results:', e);
    }
  }, [race.id]);

  // Handle results fetching only if not already provided
  const hasFetched = useRef(initialResults.length > 0);
  useEffect(() => {
    if (initialIsFinalized && !hasFetched.current) {
      hasFetched.current = true;
      const timer = setTimeout(() => {
        fetchResults();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialIsFinalized, fetchResults]);

  // SSE connection only if not finalized
  useEffect(() => {
    if (initialIsFinalized) {
      return;
    }

    let eventSource: EventSource | null = null;
    let heartbeatTimeout: NodeJS.Timeout;

    const connectSSE = () => {
      setConnectionStatus('CONNECTING');
      eventSource = new EventSource('/api/events/race-status');

      eventSource.onopen = () => {
        setConnectionStatus('CONNECTED');
        console.log('[SSE] Connected');
      };

      eventSource.onmessage = async (event) => {
        if (event.data === ': ping') {
          resetHeartbeat();
          return;
        }

        try {
          const data = JSON.parse(event.data);
          if (data.type === 'connected') return;

          if (data.type === 'RACE_BROADCAST' && data.raceId === race.id) {
            toast.success('レース結果が発表されました！');
            await fetchResults();
            setShowModal(true); // ブロードキャスト時は自動で開く
            setConnectionStatus('DISCONNECTED');
            router.refresh();
          }
        } catch (e) {
          console.error('[SSE] Parse Error', e);
        }
      };

      eventSource.onerror = (err) => {
        console.error('[SSE] Error', err);
        setConnectionStatus('DISCONNECTED');
        eventSource?.close();
        setTimeout(connectSSE, 5000);
      };
    };

    const resetHeartbeat = () => {
      clearTimeout(heartbeatTimeout);
      heartbeatTimeout = setTimeout(() => {
        setConnectionStatus('DISCONNECTED');
        eventSource?.close();
        connectSSE();
      }, 40000);
    };

    connectSSE();

    return () => {
      eventSource?.close();
      clearTimeout(heartbeatTimeout);
    };
  }, [race.id, initialIsFinalized, router, fetchResults]);

  return (
    <>
      {/* 見出し横のボタンのためのコンテナ。通常は page.tsx 側で表示したいが、ステート管理の都合上こちらで表示する。
          ここでは単純にモーダルとコネクション状況のみを返し、page.tsx 側でボタンを配置できるように検討。
          あるいは、ポータルを使用して page.tsx の見出し横に挿入する。
          今回はシンプルに、StandbyClient が見出しとボタンをセットで描画するように page.tsx を書き換える方針にする。
       */}
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span
              className={`rounded px-2 py-0.5 text-xs font-bold text-white ${
                initialIsFinalized ? 'bg-gray-600' : 'bg-green-600'
              }`}
            >
              {initialIsFinalized ? '確定済み' : '待機中'}
            </span>
            <span className="text-sm font-medium text-gray-400">
              {race.location} {race.name}
              {race.closingAt && (
                <span className="ml-3 inline-flex items-center gap-1 font-bold text-red-500/80">
                  <AlarmClock className="h-3.5 w-3.5" />
                  締切: {race.closingAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">購入馬券確認 / 待機画面</h1>
        </div>

        {initialIsFinalized && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95"
          >
            払戻結果を表示
          </button>
        )}
      </div>

      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
        {connectionStatus === 'CONNECTED' && (
          <>
            <div className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
            </div>
            <span className="text-green-400">LIVE CONNECTION</span>
          </>
        )}
        {connectionStatus === 'CONNECTING' && (
          <>
            <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
            <span className="text-yellow-500">CONNECTING...</span>
          </>
        )}
        {connectionStatus === 'DISCONNECTED' && !initialIsFinalized && (
          <>
            <WifiOff className="h-3 w-3 text-red-500" />
            <span className="text-red-500">CONNECTION LOST</span>
          </>
        )}
        {initialIsFinalized && <span className="text-gray-400">RACE FINISHED</span>}
      </div>

      <PayoutResultModal
        open={showModal}
        onOpenChange={setShowModal}
        raceName={race.name}
        raceDate={`${race.location} ${race.date}`}
        results={results}
      />
    </>
  );
}
