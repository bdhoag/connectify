import { Inject, Injectable } from '@nestjs/common';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository';
import type { AuthRepository } from '../../domain/repositories/auth.repository';

@Injectable()
export class LogoutAllUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
  ) {}

  execute(userId: string): Promise<void> {
    return this.authRepository.revokeAllUserRefreshTokens(userId);
  }
}
