import { Inject, Injectable } from '@nestjs/common';
import { MessageEntity } from '../../domain/entities/message.entity';
import { MESSAGE_REPOSITORY } from '../../domain/repositories/message.repository';
import type { MessageRepository } from '../../domain/repositories/message.repository';
import { SendMessageDto } from '../dto/send-message.dto';
import { ConversationAuthorizer } from '../services/conversation-authorizer';

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: MessageRepository,
    private readonly conversationAuthorizer: ConversationAuthorizer,
  ) {}

  async execute(
    userId: string,
    conversationId: string,
    dto: SendMessageDto,
  ): Promise<MessageEntity> {
    await this.conversationAuthorizer.assertCanAccess(userId, conversationId);

    return this.messageRepository.create({
      conversationId,
      senderId: userId,
      content: dto.content,
    });
  }
}
