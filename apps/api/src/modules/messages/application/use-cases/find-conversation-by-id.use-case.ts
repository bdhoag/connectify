import { Injectable } from '@nestjs/common';
import {
  ConversationEntity,
  ConversationMemberEntity,
} from '../../domain/entities/conversation.entity';
import { ConversationAuthorizer } from '../services/conversation-authorizer';

export interface ConversationWithMembers extends ConversationEntity {
  members: ConversationMemberEntity[];
}

@Injectable()
export class FindConversationByIdUseCase {
  constructor(
    private readonly conversationAuthorizer: ConversationAuthorizer,
  ) {}

  async execute(userId: string, id: string): Promise<ConversationWithMembers> {
    const { conversation, members } =
      await this.conversationAuthorizer.assertCanAccess(userId, id);
    return { ...conversation, members };
  }
}
