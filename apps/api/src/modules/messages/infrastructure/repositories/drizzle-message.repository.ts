import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, isNull, lt } from 'drizzle-orm';
import { DRIZZLE } from '../../../../database/database.provider';
import type { DrizzleDb } from '../../../../database/database.provider';
import { conversations, messages } from '../../../../database/schema';
import { MessageEntity } from '../../domain/entities/message.entity';
import {
  CreateMessageData,
  FindMessagesParams,
  FindMessagesResult,
  MessageRepository,
  UpdateMessageData,
} from '../../domain/repositories/message.repository';

type MessageRow = typeof messages.$inferSelect;

@Injectable()
export class DrizzleMessageRepository implements MessageRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(data: CreateMessageData): Promise<MessageEntity> {
    return this.db.transaction(async (tx) => {
      const [row] = await tx.insert(messages).values(data).returning();
      await tx
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, data.conversationId));
      return this.toEntity(row);
    });
  }

  async findById(id: string): Promise<MessageEntity | null> {
    const row = await this.db.query.messages.findFirst({
      where: and(eq(messages.id, id), isNull(messages.deletedAt)),
    });
    return row ? this.toEntity(row) : null;
  }

  // Newest-first, cursor = createdAt of the oldest message already seen by
  // the client; the next page returns messages strictly older than it.
  async findByConversation(
    params: FindMessagesParams,
  ): Promise<FindMessagesResult> {
    const where = and(
      eq(messages.conversationId, params.conversationId),
      isNull(messages.deletedAt),
      params.cursor ? lt(messages.createdAt, params.cursor) : undefined,
    );

    const rows = await this.db.query.messages.findMany({
      where,
      limit: params.limit,
      orderBy: desc(messages.createdAt),
    });

    const items = rows.map((row) => this.toEntity(row));
    const nextCursor =
      items.length === params.limit
        ? items[items.length - 1].createdAt.toISOString()
        : null;

    return { items, nextCursor };
  }

  async update(
    id: string,
    data: UpdateMessageData,
  ): Promise<MessageEntity | null> {
    const [row] = await this.db
      .update(messages)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(messages.id, id), isNull(messages.deletedAt)))
      .returning();
    return row ? this.toEntity(row) : null;
  }

  async softDelete(id: string): Promise<MessageEntity | null> {
    const [row] = await this.db
      .update(messages)
      .set({ deletedAt: new Date() })
      .where(and(eq(messages.id, id), isNull(messages.deletedAt)))
      .returning();
    return row ? this.toEntity(row) : null;
  }

  private toEntity(row: MessageRow): MessageEntity {
    return new MessageEntity({
      id: row.id,
      conversationId: row.conversationId,
      senderId: row.senderId,
      content: row.content,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    });
  }
}
