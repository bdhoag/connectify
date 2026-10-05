import { Injectable, Inject } from '@nestjs/common';
import { ConversationMemberEntity } from '../../domain/entities/conversation.entity';
import { CONVERSATION_REPOSITORY } from '../../domain/repositories/conversation.repository';
import type { ConversationRepository } from '../../domain/repositories/conversation.repository';
import { AddMemberDto } from '../dto/add-member.dto';
import { ConversationAuthorizer } from '../services/conversation-authorizer';

@Injectable()
export class AddMemberUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: ConversationRepository,
    private readonly conversationAuthorizer: ConversationAuthorizer,
  ) {}

  async execute(
    userId: string,
    conversationId: string,
    dto: AddMemberDto,
  ): Promise<ConversationMemberEntity> {
    await this.conversationAuthorizer.assertCanAccess(userId, conversationId);
    return this.conversationRepository.addMember(conversationId, dto.userId);
  }
}
