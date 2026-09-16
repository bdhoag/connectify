import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { roles } from './schema';

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  await db
    .insert(roles)
    .values([{ name: 'USER' }, { name: 'MODERATOR' }, { name: 'ADMIN' }])
    .onConflictDoNothing();

  await pool.end();
}

seed()
  .then(() => {
    console.log('Seed complete: roles (USER, MODERATOR, ADMIN)');
  })
  .catch((err) => {
    console.error('Seed failed', err);
    process.exit(1);
  });
