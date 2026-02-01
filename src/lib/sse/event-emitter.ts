import { EventEmitter } from 'events';

// グローバルでシングルトンとして管理するためのEventEmitter
class RaceEventEmitter extends EventEmitter {
  public id = Math.random().toString(36).substring(7);
  constructor() {
    super();
    console.log(`[SSE] EventEmitter Initialized: ${this.id}`);
  }
}

// グローバルオブジェクトにアタッチして、HMR等で再生成されないようにする（開発環境用）
const globalForEvents = global as unknown as { raceEventEmitter: RaceEventEmitter };

export const raceEventEmitter = globalForEvents.raceEventEmitter || new RaceEventEmitter();

if (process.env.NODE_ENV !== 'production') {
  globalForEvents.raceEventEmitter = raceEventEmitter;
}

export const RACE_EVENTS = {
  RACE_FINALIZED: 'RACE_FINALIZED',
  RACE_BROADCAST: 'RACE_BROADCAST', // 結果発表（通知）
  RACE_CLOSED: 'RACE_CLOSED',
} as const;
