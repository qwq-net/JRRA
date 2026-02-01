import { asc, eq } from 'drizzle-orm';
import { db } from './index';
import { users } from './schema';

async function main() {
  console.log('--- Granting ADMIN role to the first user ---');

  try {
    const firstUser = await db.query.users.findFirst({
      orderBy: [asc(users.createdAt)],
    });

    if (!firstUser) {
      console.warn('No users found in the database. Please login once first.');
      process.exit(1);
    }

    await db.update(users).set({ role: 'ADMIN' }).where(eq(users.id, firstUser.id));

    console.log(`Successfully granted ADMIN role to user: ${firstUser.name} (ID: ${firstUser.id})`);
    console.log('--- Done ---');
  } catch (err) {
    console.error('Failed to grant ADMIN role:', err);
    process.exit(1);
  }

  process.exit(0);
}

main();
