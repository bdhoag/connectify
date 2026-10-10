import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MediaAssetCleaner } from '../../../media/application/services/media-asset-cleaner';
import { MessagePolicy } from '../../domain/policies/message.policy';
import { MESSAGE_REPOSITORY } from '../../domain/repositories/message.repository';
import type { MessageRepository } from '../../domain/repositories/message.repository';
import { ConversationAuthorizer } from '../services/conversation-authorizer';

@Injectable()
export class DeleteMessageUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: MessageRepository,
    private readonly conversationAuthorizer: ConversationAuthorizer,
    private readonly mediaCleaner: MediaAssetCleaner,
  ) {}

  async execute(userId: string, id: string): Promise<void> {
    const message = await this.messageRepository.findById(id);
    if (!message) {
      throw new NotFoundException(`Message with id "${id}" not found`);
    }

    await this.conversationAuthorizer.assertCanAccess(
      userId,
      message.conversationId,
    );
    if (!MessagePolicy.canDelete(userId, message)) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    const deleted = await this.messageRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Message with id "${id}" not found`);
    }

    // Only after the message is gone from the database.
    await this.mediaCleaner.deleteAssets(deleted.media);
  }
}
