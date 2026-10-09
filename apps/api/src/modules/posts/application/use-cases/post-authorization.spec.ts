import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MediaAssetCleaner } from '../../../media/application/services/media-asset-cleaner';
import { MediaAttachmentValidator } from '../../../media/application/services/media-attachment-validator';
import type { MediaStorage } from '../../../media/domain/services/media-storage';
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
    media: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

function makeValidator(owned = true) {
  const storage: MediaStorage = {
    signUpload: jest.fn(),
    isOwnedUpload: jest.fn().mockReturnValue(owned),
    deleteMany: jest.fn(),
  };
  return new MediaAttachmentValidator(storage);
}

function makeCleaner() {
  return { deleteAssets: jest.fn().mockResolvedValue(undefined) };
}

const asCleaner = (c: ReturnType<typeof makeCleaner>) =>
  c as unknown as MediaAssetCleaner;

function makeRepo(post: PostEntity | null = makePost()) {
  return {
    create: jest.fn((data: { authorId: string; content: string | null }) =>
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
    await new CreatePostUseCase(repo, makeValidator()).execute(ATTACKER, {
      content: 'hi',
    });
    expect(repo.create).toHaveBeenCalledWith({
      authorId: ATTACKER,
      content: 'hi',
      media: [],
    });
  });

  it('passes validated media through to the repository', async () => {
    const repo = makeRepo();
    const media = [
      { url: 'https://res.cloudinary.com/x.jpg', publicId: 'a/b' },
    ];
    await new CreatePostUseCase(repo, makeValidator()).execute(OWNER, {
      content: 'hi',
      media,
    });
    expect(repo.create).toHaveBeenCalledWith({
      authorId: OWNER,
      content: 'hi',
      media,
    });
  });

  it('allows an images-only post', async () => {
    const repo = makeRepo();
    const media = [
      { url: 'https://res.cloudinary.com/x.jpg', publicId: 'a/b' },
    ];
    await new CreatePostUseCase(repo, makeValidator()).execute(OWNER, {
      media,
    });
    expect(repo.create).toHaveBeenCalledWith({
      authorId: OWNER,
      content: null,
      media,
    });
  });

  it.each([
    ['nothing', {}],
    ['an empty media list', { media: [] }],
    ['whitespace-only text', { content: '   ' }],
  ])('rejects a post with %s', async (_label, dto) => {
    const repo = makeRepo();
    await expect(
      new CreatePostUseCase(repo, makeValidator()).execute(OWNER, dto),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('treats whitespace-only text as no text when media is attached', async () => {
    const repo = makeRepo();
    const media = [
      { url: 'https://res.cloudinary.com/x.jpg', publicId: 'a/b' },
    ];
    await new CreatePostUseCase(repo, makeValidator()).execute(OWNER, {
      content: '   ',
      media,
    });
    expect(repo.create).toHaveBeenCalledWith({
      authorId: OWNER,
      content: null,
      media,
    });
  });

  it('rejects media the user did not upload, without creating the post', async () => {
    const repo = makeRepo();
    await expect(
      new CreatePostUseCase(repo, makeValidator(false)).execute(ATTACKER, {
        content: 'hi',
        media: [{ url: 'https://res.cloudinary.com/x.jpg', publicId: 'a/b' }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.create).not.toHaveBeenCalled();
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
    const cleaner = makeCleaner();
    await new DeletePostUseCase(repo, asCleaner(cleaner)).execute(
      OWNER,
      'post-1',
    );
    expect(repo.softDelete).toHaveBeenCalledWith('post-1');
  });

  it('deletes the post’s media from the provider after soft-deleting it', async () => {
    const media = [
      { id: 'm1', url: 'https://x/1.jpg', publicId: 'p/1', type: 'IMAGE' },
    ] as const;
    const repo = makeRepo({ ...makePost(), media: [...media] });
    const cleaner = makeCleaner();
    await new DeletePostUseCase(repo, asCleaner(cleaner)).execute(
      OWNER,
      'post-1',
    );
    expect(cleaner.deleteAssets).toHaveBeenCalledWith(media);
    expect(repo.softDelete.mock.invocationCallOrder[0]).toBeLessThan(
      cleaner.deleteAssets.mock.invocationCallOrder[0],
    );
  });

  it('forbids another user without deleting', async () => {
    const repo = makeRepo();
    const cleaner = makeCleaner();
    await expect(
      new DeletePostUseCase(repo, asCleaner(cleaner)).execute(
        ATTACKER,
        'post-1',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.softDelete).not.toHaveBeenCalled();
    expect(cleaner.deleteAssets).not.toHaveBeenCalled();
  });

  it('returns 404 for a missing post', async () => {
    const repo = makeRepo(null);
    await expect(
      new DeletePostUseCase(repo, asCleaner(makeCleaner())).execute(
        OWNER,
        'post-1',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
