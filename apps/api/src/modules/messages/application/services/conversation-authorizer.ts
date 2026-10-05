import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ConversationEntity,
  ConversationMemberEntity,
} from '../../domain/entities/conversation.entity';
import { ConversationPolicy } from '../../domain/policies/conversation.policy';
import { CONVERSATION_REPOSITORY } from '../../domain/repositories/conversation.repository';
import type { ConversationRepository } from '../../domain/repositories/conversation.repository';

export interface AuthorizedConversation {
  conversation: ConversationEntity;
  members: ConversationMemberEntity[];
}

// Every conversation-scoped use case (view, messages, members) starts with the
// same "does it exist, and is the caller in it" check; it lives here so it
// cannot be forgotten or drift between use cases.
@Injectable()
export class ConversationAuthorizer {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: ConversationRepository,
  ) {}

  // 404 if the conversation does not exist, 403 if the user is not an active
  // participant of it.
  async assertCanAccess(
    userId: string,
    conversationId: string,
  ): Promise<AuthorizedConversation> {
    const conversation =
      await this.conversationRepository.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException(
        `Conversation with id "${conversationId}" not found`,
      );
    }

    const members =
      await this.conversationRepository.findMembers(conversationId);
    if (!ConversationPolicy.canAccess(userId, members)) {
      throw new ForbiddenException(
        'You are not a participant of this conversation',
      );
    }

    return { conversation, members };
  }
}
