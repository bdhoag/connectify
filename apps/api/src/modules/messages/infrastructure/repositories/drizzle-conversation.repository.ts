import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { and, count, eq, isNull } from 'drizzle-orm';
import { DRIZZLE } from '../../../../database/database.provider';
import type { DrizzleDb } from '../../../../database/database.provider';
import { conversationMembers, conversations } from '../../../../database/schema';
import {
  ConversationEntity,
  ConversationMemberEntity,
} from '../../domain/entities/conversation.entity';
import {
  ConversationRepository,
  FindConversationsForUserParams,
  FindConversationsResult,
} from '../../domain/repositories/conversation.repository';

type ConversationRow = typeof conversations.$inferSelect;
type ConversationMemberRow = typeof conversationMembers.$inferSelect;

@Injectable()
export class DrizzleConversationRepository implements ConversationRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(memberIds: string[]): Promise<ConversationEntity> {
    return this.db.transaction(async (tx) => {
      const [row] = await tx.insert(conversations).values({}).returning();
      await tx
        .insert(conversationMembers)
        .values(memberIds.map((userId) => ({ conversationId: row.id, userId })));
      return this.toEntity(row);
    });
  }

  async findById(id: string): Promise<ConversationEntity | null> {
    const row = await this.db.query.conversations.findFirst({
      where: eq(conversations.id, id),
    });
    return row ? this.toEntity(row) : null;
  }

  async findForUser(
    params: FindConversationsForUserParams,
  ): Promise<FindConversationsResult> {
    const where = and(
      eq(conversationMembers.userId, params.userId),
      isNull(conversationMembers.leftAt),
    );

    const [rows, [{ value: total }]] = await Promise.all([
      this.db.query.conversationMembers.findMany({
        where,
        limit: params.limit,
        offset: (params.page - 1) * params.limit,
        orderBy: (m, { desc: orderDesc }) => [orderDesc(m.joinedAt)],
        with: { conversation: true },
      }),
      this.db
        .select({ value: count() })
        .from(conversationMembers)
        .where(where),
    ]);

    return {
      items: rows.map((row) => this.toEntity(row.conversation)),
      total,
    };
  }

  async findMembers(conversationId: string): Promise<ConversationMemberEntity[]> {
    const rows = await this.db.query.conversationMembers.findMany({
      where: eq(conversationMembers.conversationId, conversationId),
    });
    return rows.map((row) => this.toMemberEntity(row));
  }

  async isActiveMember(conversationId: string, userId: string): Promise<boolean> {
    const row = await this.db.query.conversationMembers.findFirst({
      where: and(
        eq(conversationMembers.conversationId, conversationId),
        eq(conversationMembers.userId, userId),
        isNull(conversationMembers.leftAt),
      ),
    });
    return !!row;
  }

  async addMember(
    conversationId: string,
    userId: string,
  ): Promise<ConversationMemberEntity> {
    try {
      const [row] = await this.db
        .insert(conversationMembers)
        .values({ conversationId, userId })
        .returning();
      return this.toMemberEntity(row);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          'This user is already a member of the conversation',
        );
      }
      throw error;
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    return this.pgErrorCode(error) === '23505';
  }

  private pgErrorCode(error: unknown): string | undefined {
    if (typeof error !== 'object' || error === null) {
      return undefined;
    }
    if ('code' in error && typeof error.code === 'string') {
      return error.code;
    }
    if ('cause' in error) {
      return this.pgErrorCode(error.cause);
    }
    return undefined;
  }

  async removeMember(conversationId: string, userId: string): Promise<boolean> {
    const rows = await this.db
      .update(conversationMembers)
      .set({ leftAt: new Date() })
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          eq(conversationMembers.userId, userId),
          isNull(conversationMembers.leftAt),
        ),
      )
      .returning();
    return rows.length > 0;
  }

  private toEntity(row: ConversationRow): ConversationEntity {
    return new ConversationEntity({
      id: row.id,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private toMemberEntity(row: ConversationMemberRow): ConversationMemberEntity {
    return new ConversationMemberEntity({
      conversationId: row.conversationId,
      userId: row.userId,
      joinedAt: row.joinedAt,
      leftAt: row.leftAt,
    });
  }
}
