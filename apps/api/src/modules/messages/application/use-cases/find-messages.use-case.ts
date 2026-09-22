import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CursorPaginationQueryDto } from '../../../../common/dto/cursor-pagination-query.dto';
import { MessageEntity } from '../../domain/entities/message.entity';
import { CONVERSATION_REPOSITORY } from '../../domain/repositories/conversation.repository';
import type { ConversationRepository } from '../../domain/repositories/conversation.repository';
import { MESSAGE_REPOSITORY } from '../../domain/repositories/message.repository';
import type { MessageRepository } from '../../domain/repositories/message.repository';

const DEFAULT_LIMIT = 20;

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

@Injectable()
export class FindMessagesUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: MessageRepository,
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: ConversationRepository,
  ) {}

  async execute(
    conversationId: string,
    query: CursorPaginationQueryDto,
  ): Promise<CursorPage<MessageEntity>> {
    const conversation = await this.conversationRepository.findById(
      conversationId,
    );
    if (!conversation) {
      throw new NotFoundException(
        `Conversation with id "${conversationId}" not found`,
      );
    }

    return this.messageRepository.findByConversation({
      conversationId,
      cursor: query.cursor ? new Date(query.cursor) : undefined,
      limit: query.limit ?? DEFAULT_LIMIT,
    });
  }
}
