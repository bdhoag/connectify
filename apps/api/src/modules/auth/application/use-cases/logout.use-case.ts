import { Inject, Injectable } from '@nestjs/common';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository';
import type { AuthRepository } from '../../domain/repositories/auth.repository';
import { TokenService } from '../../infrastructure/security/token.service';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(rawRefreshToken: string): Promise<void> {
    const tokenHash = this.tokenService.hashRefreshToken(rawRefreshToken);
    const record = await this.authRepository.findRefreshTokenByHash(tokenHash);

    // Unknown or already-revoked tokens are a no-op — logout must be safe to
    // call repeatedly without erroring.
    if (record && !record.revokedAt) {
      await this.authRepository.revokeRefreshToken(record.id);
    }
  }
}
