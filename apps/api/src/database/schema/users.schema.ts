import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { userStatusEnum } from './enums.schema';
import { userCredentials, refreshTokens } from './auth.schema';
import { userRoles } from './roles.schema';
import { follows, blocks } from './social.schema';
import { posts } from './posts.schema';
import { comments } from './comments.schema';
import { likes } from './likes.schema';
import { conversationMembers } from './messaging.schema';
import { messages } from './messaging.schema';
import { notifications, notificationPreferences } from './notifications.schema';

// email/username are UNIQUE, which already gives Postgres a covering index for
// both the uniqueness check and lookups — a separate plain index would be redundant.
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 30 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  status: userStatusEnum('status').notNull().default('ACTIVE'),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  bio: varchar('bio', { length: 500 }),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  credentials: one(userCredentials, {
    fields: [users.id],
    references: [userCredentials.userId],
  }),
  refreshTokens: many(refreshTokens),
  userRoles: many(userRoles),
  posts: many(posts),
  comments: many(comments),
  likes: many(likes),
  conversationMembers: many(conversationMembers),
  sentMessages: many(messages),
  notificationPreferences: one(notificationPreferences, {
    fields: [users.id],
    references: [notificationPreferences.userId],
  }),
  following: many(follows, { relationName: 'follower' }),
  followers: many(follows, { relationName: 'following' }),
  blocksInitiated: many(blocks, { relationName: 'blocker' }),
  blocksReceived: many(blocks, { relationName: 'blocked' }),
  notificationsReceived: many(notifications, { relationName: 'recipient' }),
  notificationsTriggered: many(notifications, { relationName: 'actor' }),
}));
