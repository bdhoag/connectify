import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, isNull, lt } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.provider';
import type { DrizzleDb } from '../../database/database.provider';
import { postMedia, posts } from '../../database/schema';

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type NewPostMedia = typeof postMedia.$inferInsert;

@Injectable()
export class PostsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  findById(id: string): Promise<Post | undefined> {
    return this.db.query.posts.findFirst({
      where: and(eq(posts.id, id), isNull(posts.deletedAt)),
      with: { media: true },
    });
  }

  listByAuthor(
    authorId: string,
    { before, limit = 20 }: { before?: Date; limit?: number } = {},
  ) {
    return this.db.query.posts.findMany({
      where: and(
        eq(posts.authorId, authorId),
        isNull(posts.deletedAt),
        before ? lt(posts.createdAt, before) : undefined,
      ),
      orderBy: desc(posts.createdAt),
      limit,
      with: { media: true },
    });
  }

  async create(data: NewPost, media?: NewPostMedia[]): Promise<Post> {
    return this.db.transaction(async (tx) => {
      const [post] = await tx.insert(posts).values(data).returning();
      if (media?.length) {
        await tx
          .insert(postMedia)
          .values(media.map((m) => ({ ...m, postId: post.id })));
      }
      return post;
    });
  }

  async update(
    id: string,
    data: Partial<Pick<NewPost, 'content'>>,
  ): Promise<Post | undefined> {
    const [post] = await this.db
      .update(posts)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
      .returning();
    return post;
  }

  async softDelete(id: string): Promise<Post | undefined> {
    const [post] = await this.db
      .update(posts)
      .set({ deletedAt: new Date() })
      .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
      .returning();
    return post;
  }
}
