import { UserEntity } from '../../../users/domain/entities/user.entity';

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface RegisterUserData {
  username: string;
  email: string;
  displayName: string;
  passwordHash: string;
}

export interface UserWithPasswordHash {
  user: UserEntity;
  passwordHash: string;
}

export interface CreateRefreshTokenData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface AuthRepository {
  registerUser(data: RegisterUserData): Promise<UserEntity>;
  findUserByEmail(email: string): Promise<UserEntity | null>;
  findUserByUsername(username: string): Promise<UserEntity | null>;
  findUserWithPasswordHashByEmail(
    email: string,
  ): Promise<UserWithPasswordHash | null>;
  createRefreshToken(data: CreateRefreshTokenData): Promise<RefreshTokenRecord>;
  // Deliberately includes revoked tokens — needed for reuse detection on refresh.
  findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  revokeRefreshToken(id: string): Promise<void>;
  revokeAllUserRefreshTokens(userId: string): Promise<void>;
}
