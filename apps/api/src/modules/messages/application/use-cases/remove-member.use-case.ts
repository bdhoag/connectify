import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CONVERSATION_REPOSITORY } from '../../domain/repositories/conversation.repository';
import type { ConversationRepository } from '../../domain/repositories/conversation.repository';

@Injectable()
export class RemoveMemberUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: ConversationRepository,
  ) {}

  async execute(conversationId: string, userId: string): Promise<void> {
    const removed = await this.conversationRepository.removeMember(
      conversationId,
      userId,
    );
    if (!removed) {
      throw new NotFoundException(
        `User "${userId}" is not an active member of conversation "${conversationId}"`,
      );
    }
  }
}
