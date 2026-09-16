import { relations, sql } from 'drizzle-orm';
import {
  check,
  index,
  pgTable,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const follows = pgTable(
  'follows',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    followerId: uuid('follower_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    followingId: uuid('following_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('follows_follower_id_following_id_key').on(
      table.followerId,
      table.followingId,
    ),
    // followerId is already indexed as the leading column of the unique
    // constraint above; followingId needs its own index for "who follows me" queries.
    index('follows_following_id_idx').on(table.followingId),
    check(
      'follows_no_self_follow_check',
      sql`${table.followerId} <> ${table.followingId}`,
    ),
  ],
);

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: 'follower',
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: 'following',
  }),
}));

export const blocks = pgTable(
  'blocks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    blockerId: uuid('blocker_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    blockedId: uuid('blocked_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('blocks_blocker_id_blocked_id_key').on(
      table.blockerId,
      table.blockedId,
    ),
    // blockerId is already indexed as the leading column of the unique
    // constraint above; blockedId needs its own index for "who blocked me" queries.
    index('blocks_blocked_id_idx').on(table.blockedId),
    check(
      'blocks_no_self_block_check',
      sql`${table.blockerId} <> ${table.blockedId}`,
    ),
  ],
);

export const blocksRelations = relations(blocks, ({ one }) => ({
  blocker: one(users, {
    fields: [blocks.blockerId],
    references: [users.id],
    relationName: 'blocker',
  }),
  blocked: one(users, {
    fields: [blocks.blockedId],
    references: [users.id],
    relationName: 'blocked',
  }),
}));
