import { CreateEventForm, EventList } from '@/features/admin/manage-events';
import { auth } from '@/shared/config/auth';
import { db } from '@/shared/db';
import { events } from '@/shared/db/schema';
import { desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function AdminEventsPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  const allEvents = await db.query.events.findMany({
    orderBy: [desc(events.createdAt)],
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Event Management</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: List */}
        <div className="rounded bg-white p-6 shadow lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">All Events</h2>
          <EventList events={allEvents} />
        </div>

        {/* Right: Create Form */}
        <div className="h-fit rounded bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Create New Event</h2>
          <CreateEventForm />
        </div>
      </div>
    </div>
  );
}
