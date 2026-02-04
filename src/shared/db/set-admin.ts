import { asc, eq } from 'drizzle-orm';
import { db } from './index';
import { users } from './schema';

async function main() {
  const args = process.argv.slice(2);
  const userArg = args.find((arg) => arg.startsWith('--user='));
  const targetUsername = userArg ? userArg.split('=')[1] : null;

  try {
    let targetUser;

    if (targetUsername) {
      console.log(`--- Finding user: ${targetUsername} ---`);
      targetUser = await db.query.users.findFirst({
        where: eq(users.name, targetUsername),
      });

      if (!targetUser) {
        console.error(`User not found: ${targetUsername}`);
        process.exit(1);
      }
    } else {
      console.log('--- Granting ADMIN role to the first user (default) ---');
      targetUser = await db.query.users.findFirst({
        orderBy: [asc(users.createdAt)],
      });

      if (!targetUser) {
        console.warn('No users found in the database. Please login once first.');
        process.exit(1);
      }
    }

    await db.update(users).set({ role: 'ADMIN' }).where(eq(users.id, targetUser.id));

    console.log(`Successfully granted ADMIN role to user: ${targetUser.name} (ID: ${targetUser.id})`);
    console.log('--- Done ---');
  } catch (err) {
    console.error('Failed to grant ADMIN role:', err);
    process.exit(1);
  }

  process.exit(0);
}

main();
