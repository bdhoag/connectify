import { ForbiddenException } from '@nestjs/common';
import { FindBlockedUsersUseCase } from './find-blocked-users.use-case';
import { FollowUserUseCase } from './follow-user.use-case';

describe('FindBlockedUsersUseCase', () => {
  const blockRepo = {
    create: jest.fn(),
    findOne: jest.fn(),
    findBlockedByUser: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    delete: jest.fn(),
  };

  it('shows a block list only to its owner', async () => {
    const useCase = new FindBlockedUsersUseCase(blockRepo);
    await expect(useCase.execute('me', 'me', {})).resolves.toBeDefined();
    await expect(useCase.execute('me', 'you', {})).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});

describe('FollowUserUseCase', () => {
  it('uses the authenticated user as the follower', async () => {
    const followRepo = {
      create: jest.fn().mockResolvedValue({}),
    };
    const blockRepo = { findOne: jest.fn().mockResolvedValue(null) };
    await new FollowUserUseCase(
      followRepo as never,
      blockRepo as never,
    ).execute('me', 'you');
    expect(followRepo.create).toHaveBeenCalledWith({
      followerId: 'me',
      followingId: 'you',
    });
  });
});
