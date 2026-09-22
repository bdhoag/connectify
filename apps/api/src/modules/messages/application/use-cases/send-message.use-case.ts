import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MessageEntity } from '../../domain/entities/message.entity';
import { CONVERSATION_REPOSITORY } from '../../domain/repositories/conversation.repository';
import type { ConversationRepository } from '../../domain/repositories/conversation.repository';
import { MESSAGE_REPOSITORY } from '../../domain/repositories/message.repository';
import type { MessageRepository } from '../../domain/repositories/message.repository';
import { SendMessageDto } from '../dto/send-message.dto';

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: MessageRepository,
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: ConversationRepository,
  ) {}

  async execute(
    conversationId: string,
    dto: SendMessageDto,
  ): Promise<MessageEntity> {
    const conversation = await this.conversationRepository.findById(
      conversationId,
    );
    if (!conversation) {
      throw new NotFoundException(
        `Conversation with id "${conversationId}" not found`,
      );
    }

    // Domain rule: a conversation must have valid participants — only an
    // active member may send messages into it.
    const isMember = await this.conversationRepository.isActiveMember(
      conversationId,
      dto.senderId,
    );
    if (!isMember) {
      throw new ForbiddenException(
        'Only active members of the conversation may send messages',
      );
    }

    return this.messageRepository.create({
      conversationId,
      senderId: dto.senderId,
      content: dto.content,
    });
  }
}
