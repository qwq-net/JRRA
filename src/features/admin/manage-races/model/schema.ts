import { RACE_CONDITIONS, RACE_SURFACES } from '@/shared/types/race';
import { z } from 'zod';

export const raceSchema = z.object({
  eventId: z.string().uuid(),
  date: z.string().min(1),
  location: z.string().min(1),
  name: z.string().min(1),
  raceNumber: z.coerce.number().int().min(1).optional(),
  distance: z.coerce.number().min(100),
  surface: z.enum(RACE_SURFACES),
  condition: z.enum(RACE_CONDITIONS).optional(),
  closingAt: z.string().optional().nullable(),
});

export type RaceInput = z.infer<typeof raceSchema>;
