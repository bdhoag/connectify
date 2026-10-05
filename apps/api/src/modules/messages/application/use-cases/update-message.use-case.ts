import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MessageEntity } from '../../domain/entities/message.entity';
import { MessagePolicy } from '../../domain/policies/message.policy';
import { MESSAGE_REPOSITORY } from '../../domain/repositories/message.repository';
import type { MessageRepository } from '../../domain/repositories/message.repository';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { ConversationAuthorizer } from '../services/conversation-authorizer';

@Injectable()
export class UpdateMessageUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: MessageRepository,
    private readonly conversationAuthorizer: ConversationAuthorizer,
  ) {}

  async execute(
    userId: string,
    id: string,
    dto: UpdateMessageDto,
  ): Promise<MessageEntity> {
    const message = await this.messageRepository.findById(id);
    if (!message) {
      throw new NotFoundException(`Message with id "${id}" not found`);
    }

    // Participant check first, so a non-participant learns nothing about who
    // wrote the message; then authorship.
    await this.conversationAuthorizer.assertCanAccess(
      userId,
      message.conversationId,
    );
    if (!MessagePolicy.canUpdate(userId, message)) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    const updated = await this.messageRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Message with id "${id}" not found`);
    }
    return updated;
  }
}
