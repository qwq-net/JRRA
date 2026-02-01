'use server';

import { db } from '@/shared/db';
import { events } from '@/shared/db/schema';
import { desc } from 'drizzle-orm';

export async function getRaces() {
  return db.query.races.findMany({
    orderBy: (races, { desc }) => [desc(races.date), races.name],
    with: {
      event: true,
    },
  });
}

export async function getEvents() {
  return db.select().from(events).orderBy(desc(events.date), events.name);
}
