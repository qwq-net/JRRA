import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { BET_TYPES } from '@/types/betting';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { finalizeRace } from './finalize';

// Mocks
vi.mock('@/shared/config/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));
vi.mock('@/shared/db', () => ({
  db: {
    transaction: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    query: {
      raceEntries: { findMany: vi.fn() },
      bets: { findMany: vi.fn() },
    },
  },
}));
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));
vi.mock('@/shared/db/schema', () => ({
  bets: { id: 'bets' },
  raceEntries: { id: 'raceEntries', finishPosition: 'finishPosition' },
  races: { id: 'races', status: 'status' },
  payoutResults: { raceId: 'raceId' },
  transactions: {},
  wallets: {},
}));

describe('finalizeRace', () => {
  const mockTx = {
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    query: {
      raceEntries: { findMany: vi.fn() },
      bets: { findMany: vi.fn() },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (db.transaction as unknown as Mock).mockImplementation(async (cb: (tx: typeof mockTx) => Promise<void>) =>
      cb(mockTx)
    );
  });

  it('should throw Unauthorized if user is not admin', async () => {
    (auth as unknown as Mock).mockResolvedValue({ user: { role: 'USER' } });
    await expect(finalizeRace('123', [])).rejects.toThrow('Unauthorized');
  });

  it('should finalize race correctly', async () => {
    (auth as unknown as Mock).mockResolvedValue({ user: { role: 'ADMIN' } });

    // Mock race entries
    mockTx.query.raceEntries.findMany.mockResolvedValue([
      { id: 'e1', horseNumber: 1, bracketNumber: 1, finishPosition: 1 },
      { id: 'e2', horseNumber: 2, bracketNumber: 2, finishPosition: 2 },
    ]);

    // Mock bets
    mockTx.query.bets.findMany.mockResolvedValue([
      {
        id: 'b1',
        amount: 100,
        details: { type: BET_TYPES.WIN, selections: [1] }, // Hit
      },
      {
        id: 'b2',
        amount: 100,
        details: { type: BET_TYPES.WIN, selections: [2] }, // Lost
      },
    ]);

    await finalizeRace('race1', [
      { entryId: 'e1', finishPosition: 1 },
      { entryId: 'e2', finishPosition: 2 },
    ]);

    // Verify updates
    expect(mockTx.update).toHaveBeenCalled();

    // Verify bet status updates
    expect(mockTx.set).toHaveBeenCalledWith(expect.objectContaining({ status: 'HIT' }));
    expect(mockTx.set).toHaveBeenCalledWith(expect.objectContaining({ status: 'LOST' }));

    // Verify payout results insertion
    expect(mockTx.insert).toHaveBeenCalled();
    expect(mockTx.values).toHaveBeenCalledWith(
      expect.objectContaining({
        raceId: 'race1',
        type: BET_TYPES.WIN,
      })
    );

    // Verify race status update
    expect(mockTx.set).toHaveBeenCalledWith(expect.objectContaining({ status: 'CLOSED' }));
  });
});
