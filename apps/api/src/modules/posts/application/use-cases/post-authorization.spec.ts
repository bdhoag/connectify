import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostEntity } from '../../domain/entities/post.entity';
import type { PostRepository } from '../../domain/repositories/post.repository';
import { CreatePostUseCase } from './create-post.use-case';
import { DeletePostUseCase } from './delete-post.use-case';
import { UpdatePostUseCase } from './update-post.use-case';

const OWNER = 'owner-id';
const ATTACKER = 'attacker-id';

const makePost = () =>
  new PostEntity({
    id: 'post-1',
    authorId: OWNER,
    content: 'hello',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

function makeRepo(post: PostEntity | null = makePost()) {
  return {
    create: jest.fn((data: { authorId: string; content: string }) =>
      Promise.resolve({ ...makePost(), ...data }),
    ),
    findById: jest.fn().mockResolvedValue(post),
    findMany: jest.fn(),
    update: jest.fn().mockResolvedValue(post),
    softDelete: jest.fn().mockResolvedValue(post),
  } satisfies PostRepository;
}

describe('CreatePostUseCase', () => {
  it('sets the author from the authenticated user', async () => {
    const repo = makeRepo();
    await new CreatePostUseCase(repo).execute(ATTACKER, { content: 'hi' });
    expect(repo.create).toHaveBeenCalledWith({
      authorId: ATTACKER,
      content: 'hi',
    });
  });
});

describe('UpdatePostUseCase', () => {
  it('allows the owner', async () => {
    const repo = makeRepo();
    await new UpdatePostUseCase(repo).execute(OWNER, 'post-1', {
      content: 'edited',
    });
    expect(repo.update).toHaveBeenCalledWith('post-1', { content: 'edited' });
  });

  it('forbids another user without touching the post', async () => {
    const repo = makeRepo();
    await expect(
      new UpdatePostUseCase(repo).execute(ATTACKER, 'post-1', {
        content: 'pwned',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('returns 404 for a missing post', async () => {
    const repo = makeRepo(null);
    await expect(
      new UpdatePostUseCase(repo).execute(OWNER, 'post-1', { content: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('DeletePostUseCase', () => {
  it('allows the owner', async () => {
    const repo = makeRepo();
    await new DeletePostUseCase(repo).execute(OWNER, 'post-1');
    expect(repo.softDelete).toHaveBeenCalledWith('post-1');
  });

  it('forbids another user without deleting', async () => {
    const repo = makeRepo();
    await expect(
      new DeletePostUseCase(repo).execute(ATTACKER, 'post-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.softDelete).not.toHaveBeenCalled();
  });

  it('returns 404 for a missing post', async () => {
    const repo = makeRepo(null);
    await expect(
      new DeletePostUseCase(repo).execute(OWNER, 'post-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
