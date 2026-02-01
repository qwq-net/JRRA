import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { revalidatePath } from 'next/cache';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { closeRace, updateRace } from './update';

// Mocks
vi.mock('@/shared/config/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));
vi.mock('@/shared/db', () => ({
  db: {
    update: vi.fn(),
  },
}));
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));
vi.mock('@/lib/sse/event-emitter', () => ({
  raceEventEmitter: {
    emit: vi.fn(),
  },
  RACE_EVENTS: {
    RACE_CLOSED: 'RACE_CLOSED',
  },
}));

describe('updateRace', () => {
  const mockUpdate = vi.fn();
  const mockSet = vi.fn();
  const mockWhere = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup DB chain mock
    mockUpdate.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockWhere });
    (db.update as unknown as Mock).mockImplementation(mockUpdate);
  });

  it('should throw Unauthorized if user is not admin', async () => {
    (auth as unknown as Mock).mockResolvedValue({ user: { role: 'USER' } });
    const formData = new FormData();

    await expect(updateRace('123', formData)).rejects.toThrow('Unauthorized');
  });

  it('should update race successfully', async () => {
    (auth as unknown as Mock).mockResolvedValue({ user: { role: 'ADMIN' } });

    const formData = new FormData();
    formData.append('date', '2024-01-02');
    formData.append('location', 'Kyoto');
    formData.append('name', 'Kyoto Cup');
    formData.append('distance', '1600');
    formData.append('surface', '芝');
    formData.append('condition', '良');

    await updateRace('123', formData);

    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Kyoto Cup',
        distance: 1600,
      })
    );
    expect(mockWhere).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/admin/races');
  });
});

describe('closeRace', () => {
  const mockUpdate = vi.fn();
  const mockSet = vi.fn();
  const mockWhere = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdate.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockWhere });
    (db.update as unknown as Mock).mockImplementation(mockUpdate);
  });

  it('should throw Unauthorized if user is not admin', async () => {
    (auth as unknown as Mock).mockResolvedValue({ user: { role: 'USER' } });
    await expect(closeRace('123')).rejects.toThrow('Unauthorized');
  });

  it('should close race and emit event', async () => {
    (auth as unknown as Mock).mockResolvedValue({ user: { role: 'ADMIN' } });

    await closeRace('123');

    expect(mockUpdate).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith({ status: 'CLOSED' });
    expect(mockWhere).toHaveBeenCalled();

    // SSE event check
    const { raceEventEmitter } = await import('@/lib/sse/event-emitter');
    expect(raceEventEmitter.emit).toHaveBeenCalledWith('RACE_CLOSED', expect.objectContaining({ raceId: '123' }));

    expect(revalidatePath).toHaveBeenCalled();
  });
});
