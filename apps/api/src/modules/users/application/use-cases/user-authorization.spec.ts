import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserPolicy } from '../../domain/policies/user.policy';
import { DeleteUserUseCase } from './delete-user.use-case';
import { UpdateUserUseCase } from './update-user.use-case';

const makeRepo = (result: object | null = { id: 'me' }) =>
  ({
    update: jest.fn().mockResolvedValue(result),
    softDelete: jest.fn().mockResolvedValue(result),
  }) as never as ConstructorParameters<typeof UpdateUserUseCase>[0] & {
    update: jest.Mock;
    softDelete: jest.Mock;
  };

describe('UserPolicy', () => {
  it('only lets a user manage their own data', () => {
    expect(UserPolicy.canManage('me', 'me')).toBe(true);
    expect(UserPolicy.canManage('me', 'you')).toBe(false);
  });
});

describe('UpdateUserUseCase / DeleteUserUseCase', () => {
  it('lets a user update and delete themselves', async () => {
    const repo = makeRepo();
    await new UpdateUserUseCase(repo).execute('me', 'me', { bio: 'hi' });
    await new DeleteUserUseCase(repo).execute('me', 'me');
    expect(repo.update).toHaveBeenCalled();
    expect(repo.softDelete).toHaveBeenCalledWith('me');
  });

  it("forbids touching another user's account", async () => {
    const repo = makeRepo();
    await expect(
      new UpdateUserUseCase(repo).execute('me', 'you', { bio: 'pwned' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      new DeleteUserUseCase(repo).execute('me', 'you'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.update).not.toHaveBeenCalled();
    expect(repo.softDelete).not.toHaveBeenCalled();
  });

  it('returns 404 when the user no longer exists', async () => {
    const repo = makeRepo(null);
    await expect(
      new UpdateUserUseCase(repo).execute('me', 'me', { bio: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
