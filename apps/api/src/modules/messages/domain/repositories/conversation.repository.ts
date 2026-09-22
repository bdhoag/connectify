import {
  ConversationEntity,
  ConversationMemberEntity,
} from '../entities/conversation.entity';

export const CONVERSATION_REPOSITORY = Symbol('CONVERSATION_REPOSITORY');

export interface FindConversationsForUserParams {
  userId: string;
  page: number;
  limit: number;
}

export interface FindConversationsResult {
  items: ConversationEntity[];
  total: number;
}

export interface ConversationRepository {
  create(memberIds: string[]): Promise<ConversationEntity>;
  findById(id: string): Promise<ConversationEntity | null>;
  findForUser(
    params: FindConversationsForUserParams,
  ): Promise<FindConversationsResult>;
  findMembers(conversationId: string): Promise<ConversationMemberEntity[]>;
  isActiveMember(conversationId: string, userId: string): Promise<boolean>;
  addMember(
    conversationId: string,
    userId: string,
  ): Promise<ConversationMemberEntity>;
  // Soft-remove: sets left_at rather than deleting the row, preserving
  // "who was in this conversation" history.
  removeMember(conversationId: string, userId: string): Promise<boolean>;
}
