import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentEntity } from '../../domain/entities/comment.entity';
import { CommentPolicy } from '../../domain/policies/comment.policy';
import type { CommentRepository } from '../../domain/repositories/comment.repository';
import { CreateCommentUseCase } from './create-comment.use-case';
import { CreateReplyUseCase } from './create-reply.use-case';
import { DeleteCommentUseCase } from './delete-comment.use-case';
import { UpdateCommentUseCase } from './update-comment.use-case';

const OWNER = 'owner-id';
const ATTACKER = 'attacker-id';

const makeComment = () =>
  new CommentEntity({
    id: 'comment-1',
    postId: 'post-1',
    authorId: OWNER,
    parentId: null,
    content: 'nice',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

function makeRepo(comment: CommentEntity | null = makeComment()) {
  return {
    create: jest.fn((data: { authorId: string }) =>
      Promise.resolve({ ...makeComment(), ...data }),
    ),
    findById: jest.fn().mockResolvedValue(comment),
    findTopLevelByPost: jest.fn(),
    findReplies: jest.fn(),
    update: jest.fn().mockResolvedValue(comment),
    softDelete: jest.fn().mockResolvedValue(comment),
  } satisfies CommentRepository;
}

describe('CommentPolicy', () => {
  it('only lets the author update or delete', () => {
    const comment = makeComment();
    expect(CommentPolicy.canUpdate(OWNER, comment)).toBe(true);
    expect(CommentPolicy.canDelete(OWNER, comment)).toBe(true);
    expect(CommentPolicy.canUpdate(ATTACKER, comment)).toBe(false);
    expect(CommentPolicy.canDelete(ATTACKER, comment)).toBe(false);
  });
});

describe('CreateCommentUseCase / CreateReplyUseCase', () => {
  it('sets the author from the authenticated user on a top-level comment', async () => {
    const repo = makeRepo();
    const posts = { findById: jest.fn().mockResolvedValue({ id: 'post-1' }) };
    await new CreateCommentUseCase(repo, posts as never).execute(
      ATTACKER,
      'post-1',
      { content: 'hi' },
    );
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ authorId: ATTACKER, postId: 'post-1' }),
    );
  });

  it('sets the author from the authenticated user on a reply', async () => {
    const repo = makeRepo();
    await new CreateReplyUseCase(repo).execute(ATTACKER, 'comment-1', {
      content: 'hi',
    });
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ authorId: ATTACKER, parentId: 'comment-1' }),
    );
  });
});

describe('UpdateCommentUseCase', () => {
  it('allows the owner', async () => {
    const repo = makeRepo();
    await new UpdateCommentUseCase(repo).execute(OWNER, 'comment-1', {
      content: 'edited',
    });
    expect(repo.update).toHaveBeenCalled();
  });

  it('forbids another user without touching the comment', async () => {
    const repo = makeRepo();
    await expect(
      new UpdateCommentUseCase(repo).execute(ATTACKER, 'comment-1', {
        content: 'pwned',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('returns 404 for a missing comment', async () => {
    await expect(
      new UpdateCommentUseCase(makeRepo(null)).execute(OWNER, 'comment-1', {
        content: 'x',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('DeleteCommentUseCase', () => {
  it('allows the owner', async () => {
    const repo = makeRepo();
    await new DeleteCommentUseCase(repo).execute(OWNER, 'comment-1');
    expect(repo.softDelete).toHaveBeenCalledWith('comment-1');
  });

  it('forbids another user without deleting', async () => {
    const repo = makeRepo();
    await expect(
      new DeleteCommentUseCase(repo).execute(ATTACKER, 'comment-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.softDelete).not.toHaveBeenCalled();
  });

  it('returns 404 for a missing comment', async () => {
    await expect(
      new DeleteCommentUseCase(makeRepo(null)).execute(OWNER, 'comment-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
