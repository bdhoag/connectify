import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.provider';
import type { DrizzleDb } from '../../database/database.provider';
import { likes } from '../../database/schema';

export type Like = typeof likes.$inferSelect;
export type NewLike = typeof likes.$inferInsert;

@Injectable()
export class LikesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  findOne(userId: string, postId: string): Promise<Like | undefined> {
    return this.db.query.likes.findFirst({
      where: and(eq(likes.userId, userId), eq(likes.postId, postId)),
    });
  }

  listForPost(postId: string) {
    return this.db.query.likes.findMany({
      where: eq(likes.postId, postId),
      with: { user: true },
    });
  }

  async like(data: NewLike): Promise<Like> {
    // Rely on the unique(user_id, post_id) constraint to make this idempotent
    // rather than doing a separate existence check first.
    const [like] = await this.db
      .insert(likes)
      .values(data)
      .onConflictDoNothing()
      .returning();
    return like;
  }

  async unlike(userId: string, postId: string): Promise<void> {
    await this.db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
  }
}
