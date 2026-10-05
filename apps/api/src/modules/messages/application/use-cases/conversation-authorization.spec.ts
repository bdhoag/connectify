import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  ConversationEntity,
  ConversationMemberEntity,
} from '../../domain/entities/conversation.entity';
import { MessageEntity } from '../../domain/entities/message.entity';
import { ConversationAuthorizer } from '../services/conversation-authorizer';
import { AddMemberUseCase } from './add-member.use-case';
import { CreateConversationUseCase } from './create-conversation.use-case';
import { DeleteMessageUseCase } from './delete-message.use-case';
import { FindConversationByIdUseCase } from './find-conversation-by-id.use-case';
import { FindMessageByIdUseCase } from './find-message-by-id.use-case';
import { FindMessagesUseCase } from './find-messages.use-case';
import { RemoveMemberUseCase } from './remove-member.use-case';
import { SendMessageUseCase } from './send-message.use-case';
import { UpdateMessageUseCase } from './update-message.use-case';

const ALICE = 'alice'; // participant, wrote the message
const BOB = 'bob'; // participant, did not write the message
const MALLORY = 'mallory'; // not a participant
const CAROL = 'carol'; // left the conversation

const now = new Date();
const conversation = new ConversationEntity({
  id: 'conv-1',
  createdAt: now,
  updatedAt: now,
});
const members = [
  new ConversationMemberEntity({
    conversationId: 'conv-1',
    userId: ALICE,
    joinedAt: now,
    leftAt: null,
  }),
  new ConversationMemberEntity({
    conversationId: 'conv-1',
    userId: BOB,
    joinedAt: now,
    leftAt: null,
  }),
  new ConversationMemberEntity({
    conversationId: 'conv-1',
    userId: CAROL,
    joinedAt: now,
    leftAt: now,
  }),
];
const message = new MessageEntity({
  id: 'msg-1',
  conversationId: 'conv-1',
  senderId: ALICE,
  content: 'secret',
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
});

function setup(options: { conversationExists?: boolean } = {}) {
  const conversationRepo = {
    create: jest.fn().mockResolvedValue(conversation),
    findById: jest
      .fn()
      .mockResolvedValue(
        options.conversationExists === false ? null : conversation,
      ),
    findForUser: jest.fn(),
    findMembers: jest.fn().mockResolvedValue(members),
    isActiveMember: jest.fn(),
    addMember: jest.fn().mockResolvedValue(members[1]),
    removeMember: jest.fn().mockResolvedValue(true),
  };
  const messageRepo = {
    create: jest.fn().mockResolvedValue(message),
    findById: jest.fn().mockResolvedValue(message),
    findByConversation: jest
      .fn()
      .mockResolvedValue({ items: [message], nextCursor: null }),
    update: jest.fn().mockResolvedValue(message),
    softDelete: jest.fn().mockResolvedValue(message),
  };
  const authorizer = new ConversationAuthorizer(conversationRepo);
  return { conversationRepo, messageRepo, authorizer };
}

describe('ConversationAuthorizer', () => {
  it('returns the conversation and members for a participant', async () => {
    const { authorizer } = setup();
    await expect(authorizer.assertCanAccess(ALICE, 'conv-1')).resolves.toEqual({
      conversation,
      members,
    });
  });

  it('throws 403 for a non-participant', async () => {
    const { authorizer } = setup();
    await expect(
      authorizer.assertCanAccess(MALLORY, 'conv-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws 403 for a user who left', async () => {
    const { authorizer } = setup();
    await expect(
      authorizer.assertCanAccess(CAROL, 'conv-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws 404 for a conversation that does not exist', async () => {
    const { authorizer } = setup({ conversationExists: false });
    await expect(
      authorizer.assertCanAccess(ALICE, 'conv-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('FindConversationByIdUseCase', () => {
  it('returns members to a participant', async () => {
    const { authorizer } = setup();
    const result = await new FindConversationByIdUseCase(authorizer).execute(
      ALICE,
      'conv-1',
    );
    expect(result.members).toEqual(members);
  });

  it('denies a non-participant who only knows the id', async () => {
    const { authorizer } = setup();
    await expect(
      new FindConversationByIdUseCase(authorizer).execute(MALLORY, 'conv-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

describe('FindMessagesUseCase', () => {
  it('returns messages to a participant', async () => {
    const { authorizer, messageRepo } = setup();
    await new FindMessagesUseCase(messageRepo, authorizer).execute(
      ALICE,
      'conv-1',
      {},
    );
    expect(messageRepo.findByConversation).toHaveBeenCalled();
  });

  it('never reads messages for a non-participant', async () => {
    const { authorizer, messageRepo } = setup();
    await expect(
      new FindMessagesUseCase(messageRepo, authorizer).execute(
        MALLORY,
        'conv-1',
        {},
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(messageRepo.findByConversation).not.toHaveBeenCalled();
  });
});

describe('SendMessageUseCase', () => {
  it('uses the authenticated user as the sender', async () => {
    const { authorizer, messageRepo } = setup();
    await new SendMessageUseCase(messageRepo, authorizer).execute(
      BOB,
      'conv-1',
      { content: 'hi' },
    );
    expect(messageRepo.create).toHaveBeenCalledWith({
      conversationId: 'conv-1',
      senderId: BOB,
      content: 'hi',
    });
  });

  it('denies a non-participant', async () => {
    const { authorizer, messageRepo } = setup();
    await expect(
      new SendMessageUseCase(messageRepo, authorizer).execute(
        MALLORY,
        'conv-1',
        { content: 'hi' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(messageRepo.create).not.toHaveBeenCalled();
  });
});

describe('FindMessageByIdUseCase', () => {
  it('returns the message to a participant', async () => {
    const { authorizer, messageRepo } = setup();
    await expect(
      new FindMessageByIdUseCase(messageRepo, authorizer).execute(BOB, 'msg-1'),
    ).resolves.toBe(message);
  });

  it('denies a non-participant who only knows the message id', async () => {
    const { authorizer, messageRepo } = setup();
    await expect(
      new FindMessageByIdUseCase(messageRepo, authorizer).execute(
        MALLORY,
        'msg-1',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns 404 for a missing message', async () => {
    const { authorizer, messageRepo } = setup();
    messageRepo.findById.mockResolvedValue(null);
    await expect(
      new FindMessageByIdUseCase(messageRepo, authorizer).execute(
        ALICE,
        'msg-1',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('UpdateMessageUseCase / DeleteMessageUseCase', () => {
  it('lets the sender edit and delete their message', async () => {
    const { authorizer, messageRepo } = setup();
    await new UpdateMessageUseCase(messageRepo, authorizer).execute(
      ALICE,
      'msg-1',
      { content: 'edited' },
    );
    await new DeleteMessageUseCase(messageRepo, authorizer).execute(
      ALICE,
      'msg-1',
    );
    expect(messageRepo.update).toHaveBeenCalled();
    expect(messageRepo.softDelete).toHaveBeenCalled();
  });

  it("forbids a participant from editing or deleting someone else's message", async () => {
    const { authorizer, messageRepo } = setup();
    await expect(
      new UpdateMessageUseCase(messageRepo, authorizer).execute(BOB, 'msg-1', {
        content: 'pwned',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      new DeleteMessageUseCase(messageRepo, authorizer).execute(BOB, 'msg-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(messageRepo.update).not.toHaveBeenCalled();
    expect(messageRepo.softDelete).not.toHaveBeenCalled();
  });

  it('forbids a non-participant', async () => {
    const { authorizer, messageRepo } = setup();
    await expect(
      new UpdateMessageUseCase(messageRepo, authorizer).execute(
        MALLORY,
        'msg-1',
        { content: 'pwned' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      new DeleteMessageUseCase(messageRepo, authorizer).execute(
        MALLORY,
        'msg-1',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('forbids a sender who has since left the conversation', async () => {
    const { authorizer, messageRepo } = setup();
    messageRepo.findById.mockResolvedValue(
      new MessageEntity({ ...message, senderId: CAROL }),
    );
    await expect(
      new UpdateMessageUseCase(messageRepo, authorizer).execute(
        CAROL,
        'msg-1',
        { content: 'edit after leaving' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(messageRepo.update).not.toHaveBeenCalled();
  });
});

describe('AddMemberUseCase', () => {
  it('lets a participant add a member', async () => {
    const { authorizer, conversationRepo } = setup();
    await new AddMemberUseCase(conversationRepo, authorizer).execute(
      ALICE,
      'conv-1',
      { userId: 'dave' },
    );
    expect(conversationRepo.addMember).toHaveBeenCalledWith('conv-1', 'dave');
  });

  it('denies a non-participant', async () => {
    const { authorizer, conversationRepo } = setup();
    await expect(
      new AddMemberUseCase(conversationRepo, authorizer).execute(
        MALLORY,
        'conv-1',
        { userId: MALLORY },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(conversationRepo.addMember).not.toHaveBeenCalled();
  });
});

describe('RemoveMemberUseCase', () => {
  it('lets a participant leave', async () => {
    const { authorizer, conversationRepo } = setup();
    await new RemoveMemberUseCase(conversationRepo, authorizer).execute(
      ALICE,
      'conv-1',
      ALICE,
    );
    expect(conversationRepo.removeMember).toHaveBeenCalledWith('conv-1', ALICE);
  });

  it('forbids removing another participant', async () => {
    const { authorizer, conversationRepo } = setup();
    await expect(
      new RemoveMemberUseCase(conversationRepo, authorizer).execute(
        ALICE,
        'conv-1',
        BOB,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(conversationRepo.removeMember).not.toHaveBeenCalled();
  });

  it('forbids a non-participant', async () => {
    const { authorizer, conversationRepo } = setup();
    await expect(
      new RemoveMemberUseCase(conversationRepo, authorizer).execute(
        MALLORY,
        'conv-1',
        ALICE,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

describe('CreateConversationUseCase', () => {
  it('always includes the creator and drops duplicates', async () => {
    const { conversationRepo } = setup();
    await new CreateConversationUseCase(conversationRepo).execute(ALICE, {
      memberIds: [BOB, ALICE],
    });
    expect(conversationRepo.create).toHaveBeenCalledWith([ALICE, BOB]);
  });

  it('rejects a conversation with nobody but the creator', async () => {
    const { conversationRepo } = setup();
    await expect(
      new CreateConversationUseCase(conversationRepo).execute(ALICE, {
        memberIds: [ALICE],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(conversationRepo.create).not.toHaveBeenCalled();
  });
});
