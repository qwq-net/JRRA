import { RACE_EVENTS, raceEventEmitter } from '@/lib/sse/event-emitter';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  // SSEストリームの作成
  const customReadable = new ReadableStream({
    start(controller) {
      console.log(`[SSE] Client connected. Using EventEmitter: ${raceEventEmitter.id}`);

      // 接続時の初期メッセージ（デバッグ用）
      controller.enqueue(encoder.encode(`data: {"type":"connected","id":"${raceEventEmitter.id}"}\n\n`));

      // イベントリスナー: レース確定
      const onRaceFinalized = (data: { raceId: string }) => {
        console.log(`[SSE] Emitting RACE_FINALIZED for race: ${data.raceId}`);
        const payload = JSON.stringify({ type: 'RACE_FINALIZED', ...data });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };

      // イベントリスナー: 結果発表（ブロードキャスト）
      const onRaceBroadcast = (data: { raceId: string }) => {
        console.log(`[SSE] Emitting RACE_BROADCAST for race: ${data.raceId}`);
        const payload = JSON.stringify({ type: 'RACE_BROADCAST', ...data });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };

      const onRaceClosed = (data: { raceId: string }) => {
        console.log(`[SSE] Emitting RACE_CLOSED for race: ${data.raceId}`);
        const payload = JSON.stringify({ type: 'RACE_CLOSED', ...data });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };

      raceEventEmitter.on(RACE_EVENTS.RACE_FINALIZED, onRaceFinalized);
      raceEventEmitter.on(RACE_EVENTS.RACE_BROADCAST, onRaceBroadcast);
      raceEventEmitter.on(RACE_EVENTS.RACE_CLOSED, onRaceClosed);

      // Heartbeat: 30秒ごとにpingを送信
      // data: をつけることで EventSource の onmessage が発火するようにする
      const heartbeatInterval = setInterval(() => {
        controller.enqueue(encoder.encode('data: : ping\n\n'));
      }, 30000);

      // クライアント切断時のクリーンアップ
      req.signal.addEventListener('abort', () => {
        console.log(`[SSE] Client disconnected. Cleaning up listeners for EventEmitter: ${raceEventEmitter.id}`);
        clearInterval(heartbeatInterval);
        raceEventEmitter.off(RACE_EVENTS.RACE_FINALIZED, onRaceFinalized);
        raceEventEmitter.off(RACE_EVENTS.RACE_BROADCAST, onRaceBroadcast);
        raceEventEmitter.off(RACE_EVENTS.RACE_CLOSED, onRaceClosed);
        controller.close();
      });
    },
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
