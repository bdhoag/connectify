import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { mediaTypeEnum } from './enums.schema';
import { users } from './users.schema';
import { comments } from './comments.schema';
import { likes } from './likes.schema';

export const posts = pgTable(
  'posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // RESTRICT (not cascade): posts are content with their own soft-delete
    // (deleted_at) — a hard user delete shouldn't silently wipe their posts.
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    // Nullable: a post may be media only. At least one of content or media
    // is enforced in CreatePostUseCase.
    content: text('content'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('posts_author_id_idx').on(table.authorId),
    index('posts_created_at_idx').on(table.createdAt),
  ],
);

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  media: many(postMedia),
  comments: many(comments),
  likes: many(likes),
}));

export const postMedia = pgTable(
  'post_media',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    mediaUrl: text('media_url').notNull(),
    // Cloudinary public_id: needed to delete the asset later.
    publicId: text('public_id').notNull(),
    mediaType: mediaTypeEnum('media_type').notNull(),
    // Display order within the parent (0-based).
    position: integer('position').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('post_media_post_id_idx').on(table.postId)],
);

export const postMediaRelations = relations(postMedia, ({ one }) => ({
  post: one(posts, {
    fields: [postMedia.postId],
    references: [posts.id],
  }),
}));
