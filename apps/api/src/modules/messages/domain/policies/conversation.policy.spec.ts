import { ConversationMemberEntity } from '../entities/conversation.entity';
import { ConversationPolicy } from './conversation.policy';

const member = (userId: string, leftAt: Date | null = null) =>
  new ConversationMemberEntity({
    conversationId: 'conv-1',
    userId,
    joinedAt: new Date(),
    leftAt,
  });

describe('ConversationPolicy', () => {
  const members = [member('alice'), member('bob'), member('carol', new Date())];

  it('allows active participants', () => {
    expect(ConversationPolicy.canAccess('alice', members)).toBe(true);
    expect(ConversationPolicy.canAccess('bob', members)).toBe(true);
  });

  it('denies non-participants', () => {
    expect(ConversationPolicy.canAccess('mallory', members)).toBe(false);
  });

  it('denies participants who have left', () => {
    expect(ConversationPolicy.canAccess('carol', members)).toBe(false);
  });

  it('denies everyone for an empty member list', () => {
    expect(ConversationPolicy.canAccess('alice', [])).toBe(false);
  });

  it('only lets a participant remove themselves', () => {
    expect(ConversationPolicy.canRemoveMember('alice', 'alice')).toBe(true);
    expect(ConversationPolicy.canRemoveMember('alice', 'bob')).toBe(false);
  });
});
