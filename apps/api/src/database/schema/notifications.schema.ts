import { relations } from 'drizzle-orm';
import { boolean, index, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import {
  notificationEntityTypeEnum,
  notificationTypeEnum,
} from './enums.schema';
import { users } from './users.schema';

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Recipient — the user this notification is for. CASCADE: the recipient's
    // notification inbox has no purpose once the recipient account is gone.
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Actor — the user who performed the triggering action. CASCADE: a
    // notification referencing an actor who no longer exists is meaningless
    // (e.g. "X liked your post" once X is gone), and actor_id is NOT NULL so
    // SET NULL isn't an option.
    actorId: uuid('actor_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: notificationTypeEnum('type').notNull(),
    entityType: notificationEntityTypeEnum('entity_type').notNull(),
    // Intentionally NOT a foreign key: entity_id is a polymorphic reference
    // whose target table depends on entity_type (post, comment, etc.).
    entityId: uuid('entity_id').notNull(),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('notifications_user_id_idx').on(table.userId),
    index('notifications_actor_id_idx').on(table.actorId),
    index('notifications_created_at_idx').on(table.createdAt),
  ],
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, {
    fields: [notifications.userId],
    references: [users.id],
    relationName: 'recipient',
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
    relationName: 'actor',
  }),
}));

export const notificationPreferences = pgTable('notification_preferences', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  likesEnabled: boolean('likes_enabled').notNull().default(true),
  commentsEnabled: boolean('comments_enabled').notNull().default(true),
  followsEnabled: boolean('follows_enabled').notNull().default(true),
  messagesEnabled: boolean('messages_enabled').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const notificationPreferencesRelations = relations(
  notificationPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [notificationPreferences.userId],
      references: [users.id],
    }),
  }),
);
