import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  UserEntity,
  UserStatus,
} from '../../../users/domain/entities/user.entity';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository';
import type { AuthRepository } from '../../domain/repositories/auth.repository';
import { PASSWORD_HASHER } from '../../infrastructure/security/password-hasher';
import type { PasswordHasher } from '../../infrastructure/security/password-hasher';
import { TokenService } from '../../infrastructure/security/token.service';
import { LoginDto } from '../dto/login.dto';

export interface LoginResult {
  user: UserEntity;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResult> {
    const found = await this.authRepository.findUserWithPasswordHashByEmail(
      dto.email,
    );
    if (!found) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const passwordValid = await this.passwordHasher.verify(
      found.passwordHash,
      dto.password,
    );
    if (!passwordValid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    // Only checked after the password is confirmed correct — by this point the
    // caller has already proven ownership of the account, so this no longer
    // leaks anything an attacker without the password could exploit.
    if (found.user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('This account is not active');
    }

    const accessToken = this.tokenService.signAccessToken(found.user.id);
    const refreshToken = this.tokenService.generateRefreshToken();
    const refreshTokenExpiresAt = this.tokenService.getRefreshTokenExpiresAt();

    await this.authRepository.createRefreshToken({
      userId: found.user.id,
      tokenHash: this.tokenService.hashRefreshToken(refreshToken),
      expiresAt: refreshTokenExpiresAt,
    });

    return {
      user: found.user,
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
    };
  }
}
