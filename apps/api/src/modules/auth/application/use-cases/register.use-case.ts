import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../../../users/domain/entities/user.entity';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth.repository';
import type { AuthRepository } from '../../domain/repositories/auth.repository';
import { PASSWORD_HASHER } from '../../infrastructure/security/password-hasher';
import type { PasswordHasher } from '../../infrastructure/security/password-hasher';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(dto: RegisterDto): Promise<UserEntity> {
    const [existingByEmail, existingByUsername] = await Promise.all([
      this.authRepository.findUserByEmail(dto.email),
      this.authRepository.findUserByUsername(dto.username),
    ]);

    if (existingByEmail) {
      throw new ConflictException('A user with this email already exists');
    }
    if (existingByUsername) {
      throw new ConflictException('A user with this username already exists');
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    return this.authRepository.registerUser({
      username: dto.username,
      email: dto.email,
      displayName: dto.username,
      passwordHash,
    });
  }
}
