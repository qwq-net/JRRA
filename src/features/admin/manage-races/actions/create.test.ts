import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { revalidatePath } from 'next/cache';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRace } from './create';

vi.mock('@/shared/config/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));
vi.mock('@/shared/db', () => ({
  db: {
    insert: vi.fn(),
  },
}));
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('createRace', () => {
  const mockInsert = vi.fn();
  const mockValues = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockInsert.mockReturnValue({ values: mockValues });
    (db.insert as unknown as Mock).mockImplementation(mockInsert);
  });

  it('should throw Unauthorized if user is not admin', async () => {
    (auth as unknown as Mock).mockResolvedValue({ user: { role: 'USER' } });
    const formData = new FormData();

    await expect(createRace(formData)).rejects.toThrow('Unauthorized');
  });

  it('should throw Invalid Input if formData is empty', async () => {
    (auth as unknown as Mock).mockResolvedValue({ user: { role: 'ADMIN' } });
    const formData = new FormData();

    await expect(createRace(formData)).rejects.toThrow('Invalid Input');
  });

  it('should create race successfully with valid data', async () => {
    (auth as unknown as Mock).mockResolvedValue({ user: { role: 'ADMIN' } });

    const formData = new FormData();
    formData.append('eventId', '550e8400-e29b-41d4-a716-446655440000');
    formData.append('date', '2024-01-01');
    formData.append('location', 'Tokyo');
    formData.append('name', 'New Year Cup');
    formData.append('distance', '2000');
    formData.append('surface', '芝');
    formData.append('condition', '良');
    formData.append('closingAt', '2024-01-01T10:00:00');

    await createRace(formData);

    expect(mockInsert).toHaveBeenCalled();
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'New Year Cup',
        distance: 2000,
      })
    );
    expect(revalidatePath).toHaveBeenCalledWith('/admin/races');
  });
});
