import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type ConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';

interface UseRaceEventsProps {
  raceId: string;
  isFinalized: boolean;
  onRaceBroadcast?: () => void;
}

export function useRaceEvents({ raceId, isFinalized, onRaceBroadcast }: UseRaceEventsProps) {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    isFinalized ? 'DISCONNECTED' : 'CONNECTING'
  );

  useEffect(() => {
    if (isFinalized) {
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

          if (data.type === 'RACE_BROADCAST' && data.raceId === raceId) {
            toast.success('レース結果が発表されました！');
            onRaceBroadcast?.();
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
  }, [raceId, isFinalized, router, onRaceBroadcast]);

  return { connectionStatus };
}
