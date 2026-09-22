import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConversationMemberEntity } from '../../domain/entities/conversation.entity';
import { CONVERSATION_REPOSITORY } from '../../domain/repositories/conversation.repository';
import type { ConversationRepository } from '../../domain/repositories/conversation.repository';
import { AddMemberDto } from '../dto/add-member.dto';

@Injectable()
export class AddMemberUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: ConversationRepository,
  ) {}

  async execute(
    conversationId: string,
    dto: AddMemberDto,
  ): Promise<ConversationMemberEntity> {
    const conversation = await this.conversationRepository.findById(
      conversationId,
    );
    if (!conversation) {
      throw new NotFoundException(
        `Conversation with id "${conversationId}" not found`,
      );
    }

    return this.conversationRepository.addMember(conversationId, dto.userId);
  }
}
