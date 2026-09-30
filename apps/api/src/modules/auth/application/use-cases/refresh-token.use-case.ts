import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository';
import type { AuthRepository } from '../../domain/repositories/auth.repository';
import { TokenService } from '../../infrastructure/security/token.service';

export interface RefreshResult {
  userId: string;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

const INVALID_REFRESH_TOKEN_MESSAGE = 'Invalid or expired refresh token';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(rawRefreshToken: string): Promise<RefreshResult> {
    const tokenHash = this.tokenService.hashRefreshToken(rawRefreshToken);
    const record = await this.authRepository.findRefreshTokenByHash(tokenHash);

    if (!record) {
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);
    }

    if (record.revokedAt) {
      // A revoked token being presented again means it was likely stolen and
      // replayed — kill every active session for this user defensively.
      await this.authRepository.revokeAllUserRefreshTokens(record.userId);
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      await this.authRepository.revokeRefreshToken(record.id);
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);
    }

    await this.authRepository.revokeRefreshToken(record.id);

    const accessToken = this.tokenService.signAccessToken(record.userId);
    const refreshToken = this.tokenService.generateRefreshToken();
    const refreshTokenExpiresAt = this.tokenService.getRefreshTokenExpiresAt();

    await this.authRepository.createRefreshToken({
      userId: record.userId,
      tokenHash: this.tokenService.hashRefreshToken(refreshToken),
      expiresAt: refreshTokenExpiresAt,
    });

    return {
      userId: record.userId,
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
    };
  }
}
