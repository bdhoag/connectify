import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ConversationEntity,
  ConversationMemberEntity,
} from '../../domain/entities/conversation.entity';
import { CONVERSATION_REPOSITORY } from '../../domain/repositories/conversation.repository';
import type { ConversationRepository } from '../../domain/repositories/conversation.repository';

export interface ConversationWithMembers extends ConversationEntity {
  members: ConversationMemberEntity[];
}

@Injectable()
export class FindConversationByIdUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: ConversationRepository,
  ) {}

  async execute(id: string): Promise<ConversationWithMembers> {
    const conversation = await this.conversationRepository.findById(id);
    if (!conversation) {
      throw new NotFoundException(`Conversation with id "${id}" not found`);
    }

    const members = await this.conversationRepository.findMembers(id);
    return { ...conversation, members };
  }
}
