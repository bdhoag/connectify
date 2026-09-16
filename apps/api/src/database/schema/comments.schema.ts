import { relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { mediaTypeEnum } from './enums.schema';
import { users } from './users.schema';
import { posts } from './posts.schema';

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    // RESTRICT (not cascade): comments are content with their own soft-delete
    // (deleted_at) — a hard user delete shouldn't silently wipe their comments.
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    // Self-reference for replies; CASCADE so deleting a parent comment row
    // also removes its reply subtree. NULL = top-level comment.
    parentId: uuid('parent_id').references((): AnyPgColumn => comments.id, {
      onDelete: 'cascade',
    }),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('comments_post_id_idx').on(table.postId),
    index('comments_author_id_idx').on(table.authorId),
    index('comments_parent_id_idx').on(table.parentId),
  ],
);

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: 'replies',
  }),
  replies: many(comments, { relationName: 'replies' }),
  media: many(commentMedia),
}));

export const commentMedia = pgTable(
  'comment_media',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    commentId: uuid('comment_id')
      .notNull()
      .references(() => comments.id, { onDelete: 'cascade' }),
    mediaUrl: text('media_url').notNull(),
    mediaType: mediaTypeEnum('media_type').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('comment_media_comment_id_idx').on(table.commentId)],
);

export const commentMediaRelations = relations(commentMedia, ({ one }) => ({
  comment: one(comments, {
    fields: [commentMedia.commentId],
    references: [comments.id],
  }),
}));
