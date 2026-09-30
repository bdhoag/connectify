import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../../users/users.module';
import { GetCurrentUserUseCase } from '../application/use-cases/get-current-user.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { LogoutAllUseCase } from '../application/use-cases/logout-all.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { AUTH_REPOSITORY } from '../domain/repositories/auth.repository';
import { DrizzleAuthRepository } from '../infrastructure/repositories/drizzle-auth.repository';
import {
  Argon2PasswordHasher,
  PASSWORD_HASHER,
} from '../infrastructure/security/password-hasher';
import { TokenService } from '../infrastructure/security/token.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          // jsonwebtoken types expiresIn as `number | StringValue` (a template
          // literal type from `ms`); an env-sourced string can't be narrowed
          // to that literal pattern at compile time, so it's asserted here.
          expiresIn: configService.getOrThrow<string>(
            'JWT_ACCESS_EXPIRES_IN',
          ) as unknown as number,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: AUTH_REPOSITORY, useClass: DrizzleAuthRepository },
    { provide: PASSWORD_HASHER, useClass: Argon2PasswordHasher },
    TokenService,
    JwtAuthGuard,
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    LogoutAllUseCase,
    GetCurrentUserUseCase,
  ],
  // Exported so other modules (posts, comments, ...) can protect their own
  // routes with the same guard/token verification once they add auth checks.
  exports: [JwtAuthGuard, TokenService],
})
export class AuthModule {}
