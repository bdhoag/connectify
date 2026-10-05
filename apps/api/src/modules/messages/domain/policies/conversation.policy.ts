import { ConversationMemberEntity } from '../entities/conversation.entity';

// Conversations are private to their participants: access is decided by
// membership, not ownership. `members` is the conversation's full member list
// (including users who have left, which is why `leftAt` is checked).
export class ConversationPolicy {
  // View the conversation, read its messages, send messages, add members.
  static canAccess(
    userId: string,
    members: ConversationMemberEntity[],
  ): boolean {
    return members.some(
      (member) => member.userId === userId && member.leftAt === null,
    );
  }

  // There is no conversation-admin concept yet, so a participant may only
  // remove themselves (leave), never somebody else.
  static canRemoveMember(userId: string, memberId: string): boolean {
    return userId === memberId;
  }
}
