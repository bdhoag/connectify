import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MediaAttachmentValidator } from '../../../media/application/services/media-attachment-validator';
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
    private readonly mediaValidator: MediaAttachmentValidator,
  ) {}

  async execute(
    userId: string,
    conversationId: string,
    dto: SendMessageDto,
  ): Promise<MessageEntity> {
    await this.conversationAuthorizer.assertCanAccess(userId, conversationId);

    const media = dto.media ?? [];
    // Whitespace-only text counts as no text.
    const content = dto.content?.trim() ? dto.content : null;
    if (!content && media.length === 0) {
      throw new BadRequestException('A message needs content or media');
    }
    this.mediaValidator.assertOwned(userId, 'messages', media);

    return this.messageRepository.create({
      conversationId,
      senderId: userId,
      content,
      media,
    });
  }
}
