import { Inject, Injectable } from '@nestjs/common';
import { CursorPaginationQueryDto } from '../../../../common/dto/cursor-pagination-query.dto';
import { MessageEntity } from '../../domain/entities/message.entity';
import { MESSAGE_REPOSITORY } from '../../domain/repositories/message.repository';
import type { MessageRepository } from '../../domain/repositories/message.repository';
import { ConversationAuthorizer } from '../services/conversation-authorizer';

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
    private readonly conversationAuthorizer: ConversationAuthorizer,
  ) {}

  async execute(
    userId: string,
    conversationId: string,
    query: CursorPaginationQueryDto,
  ): Promise<CursorPage<MessageEntity>> {
    await this.conversationAuthorizer.assertCanAccess(userId, conversationId);

    return this.messageRepository.findByConversation({
      conversationId,
      cursor: query.cursor ? new Date(query.cursor) : undefined,
      limit: query.limit ?? DEFAULT_LIMIT,
    });
  }
}
