import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConversationPolicy } from '../../domain/policies/conversation.policy';
import { CONVERSATION_REPOSITORY } from '../../domain/repositories/conversation.repository';
import type { ConversationRepository } from '../../domain/repositories/conversation.repository';
import { ConversationAuthorizer } from '../services/conversation-authorizer';

@Injectable()
export class RemoveMemberUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: ConversationRepository,
    private readonly conversationAuthorizer: ConversationAuthorizer,
  ) {}

  async execute(
    userId: string,
    conversationId: string,
    memberId: string,
  ): Promise<void> {
    await this.conversationAuthorizer.assertCanAccess(userId, conversationId);
    if (!ConversationPolicy.canRemoveMember(userId, memberId)) {
      throw new ForbiddenException(
        'You can only remove yourself from a conversation',
      );
    }

    const removed = await this.conversationRepository.removeMember(
      conversationId,
      memberId,
    );
    if (!removed) {
      throw new NotFoundException(
        `User "${memberId}" is not an active member of conversation "${conversationId}"`,
      );
    }
  }
}
