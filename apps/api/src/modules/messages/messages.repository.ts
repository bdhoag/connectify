import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, isNull, lt } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.provider';
import type { DrizzleDb } from '../../database/database.provider';
import {
  conversationMembers,
  conversations,
  messageMedia,
  messages,
} from '../../database/schema';

export type Conversation = typeof conversations.$inferSelect;
export type ConversationMember = typeof conversationMembers.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type NewMessageMedia = typeof messageMedia.$inferInsert;

@Injectable()
export class MessagesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async createConversation(memberIds: string[]): Promise<Conversation> {
    return this.db.transaction(async (tx) => {
      const [conversation] = await tx
        .insert(conversations)
        .values({})
        .returning();
      await tx.insert(conversationMembers).values(
        memberIds.map((userId) => ({
          conversationId: conversation.id,
          userId,
        })),
      );
      return conversation;
    });
  }

  async addMember(
    conversationId: string,
    userId: string,
  ): Promise<ConversationMember> {
    const [member] = await this.db
      .insert(conversationMembers)
      .values({ conversationId, userId })
      .returning();
    return member;
  }

  async removeMember(conversationId: string, userId: string): Promise<void> {
    await this.db
      .update(conversationMembers)
      .set({ leftAt: new Date() })
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          eq(conversationMembers.userId, userId),
          isNull(conversationMembers.leftAt),
        ),
      );
  }

  listMembers(conversationId: string) {
    return this.db.query.conversationMembers.findMany({
      where: eq(conversationMembers.conversationId, conversationId),
      with: { user: true },
    });
  }

  listConversationsForUser(userId: string) {
    return this.db.query.conversationMembers.findMany({
      where: and(
        eq(conversationMembers.userId, userId),
        isNull(conversationMembers.leftAt),
      ),
      with: { conversation: true },
    });
  }

  async sendMessage(
    data: NewMessage,
    media?: NewMessageMedia[],
  ): Promise<Message> {
    return this.db.transaction(async (tx) => {
      const [message] = await tx.insert(messages).values(data).returning();
      if (media?.length) {
        await tx
          .insert(messageMedia)
          .values(media.map((m) => ({ ...m, messageId: message.id })));
      }
      await tx
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, data.conversationId));
      return message;
    });
  }

  listMessages(
    conversationId: string,
    { before, limit = 50 }: { before?: Date; limit?: number } = {},
  ) {
    return this.db.query.messages.findMany({
      where: and(
        eq(messages.conversationId, conversationId),
        isNull(messages.deletedAt),
        before ? lt(messages.createdAt, before) : undefined,
      ),
      orderBy: asc(messages.createdAt),
      limit,
      with: { media: true },
    });
  }

  async softDeleteMessage(id: string): Promise<Message | undefined> {
    const [message] = await this.db
      .update(messages)
      .set({ deletedAt: new Date() })
      .where(and(eq(messages.id, id), isNull(messages.deletedAt)))
      .returning();
    return message;
  }
}
