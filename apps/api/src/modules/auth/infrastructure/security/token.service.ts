import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export interface AccessTokenPayload {
  sub: string;
}

const DURATION_UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  signAccessToken(userId: string): string {
    const payload: AccessTokenPayload = { sub: userId };
    return this.jwtService.sign(payload);
  }

  verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return this.jwtService.verifyAsync<AccessTokenPayload>(token);
  }

  generateRefreshToken(): string {
    return randomBytes(48).toString('hex');
  }

  hashRefreshToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  getRefreshTokenExpiresAt(): Date {
    const expiresIn = this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );
    return new Date(Date.now() + this.parseDurationMs(expiresIn));
  }

  // Only needs to support the small duration vocabulary this project uses
  // in env config (e.g. "15m", "7d") — not a general ISO-8601 parser.
  private parseDurationMs(duration: string): number {
    const match = /^(\d+)([smhd])$/.exec(duration);
    if (!match) {
      throw new Error(
        `Invalid duration "${duration}". Expected a number followed by s/m/h/d, e.g. "15m".`,
      );
    }
    return Number(match[1]) * DURATION_UNIT_MS[match[2]];
  }
}
