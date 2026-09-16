import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.provider';
import type { DrizzleDb } from '../../database/database.provider';
import { commentMedia, comments } from '../../database/schema';

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type NewCommentMedia = typeof commentMedia.$inferInsert;

@Injectable()
export class CommentsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  findById(id: string): Promise<Comment | undefined> {
    return this.db.query.comments.findFirst({
      where: and(eq(comments.id, id), isNull(comments.deletedAt)),
      with: { media: true },
    });
  }

  // Top-level comments for a post; replies are fetched separately via findReplies.
  listTopLevelByPost(postId: string) {
    return this.db.query.comments.findMany({
      where: and(
        eq(comments.postId, postId),
        isNull(comments.parentId),
        isNull(comments.deletedAt),
      ),
      orderBy: asc(comments.createdAt),
      with: { media: true },
    });
  }

  listReplies(parentId: string) {
    return this.db.query.comments.findMany({
      where: and(eq(comments.parentId, parentId), isNull(comments.deletedAt)),
      orderBy: asc(comments.createdAt),
      with: { media: true },
    });
  }

  async create(data: NewComment, media?: NewCommentMedia[]): Promise<Comment> {
    return this.db.transaction(async (tx) => {
      const [comment] = await tx.insert(comments).values(data).returning();
      if (media?.length) {
        await tx
          .insert(commentMedia)
          .values(media.map((m) => ({ ...m, commentId: comment.id })));
      }
      return comment;
    });
  }

  async update(
    id: string,
    data: Partial<Pick<NewComment, 'content'>>,
  ): Promise<Comment | undefined> {
    const [comment] = await this.db
      .update(comments)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(comments.id, id), isNull(comments.deletedAt)))
      .returning();
    return comment;
  }

  async softDelete(id: string): Promise<Comment | undefined> {
    const [comment] = await this.db
      .update(comments)
      .set({ deletedAt: new Date() })
      .where(and(eq(comments.id, id), isNull(comments.deletedAt)))
      .returning();
    return comment;
  }
}
