import 'dotenv/config';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { roles, userCredentials, users } from './schema';

// Shared by every seeded dev account. Local development only — never a real
// credential, and seeding never runs against production.
const DEV_PASSWORD = 'Password123';

const DEV_USERS = [
  { username: 'alice', email: 'alice@connectify.dev', displayName: 'Alice' },
  { username: 'bob', email: 'bob@connectify.dev', displayName: 'Bob' },
  {
    username: 'charlie',
    email: 'charlie@connectify.dev',
    displayName: 'Charlie',
  },
];

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  await db
    .insert(roles)
    .values([{ name: 'USER' }, { name: 'MODERATOR' }, { name: 'ADMIN' }])
    .onConflictDoNothing();

  const passwordHash = await argon2.hash(DEV_PASSWORD, {
    type: argon2.argon2id,
  });

  for (const devUser of DEV_USERS) {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, devUser.email),
    });
    if (existing) {
      continue;
    }

    await db.transaction(async (tx) => {
      const [userRow] = await tx.insert(users).values(devUser).returning();
      await tx
        .insert(userCredentials)
        .values({ userId: userRow.id, passwordHash });
    });
  }

  await pool.end();
}

seed()
  .then(() => {
    console.log('Seed complete: roles (USER, MODERATOR, ADMIN)');
    console.log(
      `Seed complete: users (${DEV_USERS.map((u) => u.username).join(', ')}) — password "${DEV_PASSWORD}"`,
    );
  })
  .catch((err) => {
    console.error('Seed failed', err);
    process.exit(1);
  });
