import { redis } from './redis';

async function main() {
  console.log('--- Clearing Redis Database ---');
  try {
    const result = await redis.flushdb();
    console.log(`Successfully cleared Redis database. Result: ${result}`);
  } catch (error) {
    console.error('Failed to clear Redis:', error);
    process.exit(1);
  } finally {
    await redis.quit();
    process.exit(0);
  }
}

main();
