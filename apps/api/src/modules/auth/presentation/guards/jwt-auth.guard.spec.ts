import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { TokenService } from '../../infrastructure/security/token.service';
import { Public } from '../decorators/public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

class TestController {
  protectedRoute() {
    return undefined;
  }

  @Public()
  publicRoute() {
    return undefined;
  }
}

function contextFor(
  handler: () => unknown,
  headers: Record<string, string> = {},
) {
  const request: { headers: Record<string, string>; user?: unknown } = {
    headers,
  };
  const context = {
    getHandler: () => handler,
    getClass: () => TestController,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
}

// Metadata from @Public() lives on the original method, so the prototype
// methods are passed as-is (binding them would drop it).
/* eslint-disable @typescript-eslint/unbound-method */
const protectedRoute = TestController.prototype.protectedRoute;
const publicRoute = TestController.prototype.publicRoute;
/* eslint-enable @typescript-eslint/unbound-method */

describe('JwtAuthGuard', () => {
  const verifyAccessToken = jest.fn();
  const tokenService = { verifyAccessToken } as unknown as TokenService;
  const guard = new JwtAuthGuard(tokenService, new Reflector());

  beforeEach(() => jest.resetAllMocks());

  it('rejects requests without a token on a protected route', async () => {
    const { context } = contextFor(protectedRoute);
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects an invalid token', async () => {
    verifyAccessToken.mockRejectedValue(new Error('bad'));
    const { context } = contextFor(protectedRoute, {
      authorization: 'Bearer nope',
    });
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('attaches the user for a valid token', async () => {
    verifyAccessToken.mockResolvedValue({ sub: 'user-1' });
    const { context, request } = contextFor(protectedRoute, {
      authorization: 'Bearer good',
    });
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({ id: 'user-1' });
  });

  it('lets @Public() routes through without a token', async () => {
    const { context } = contextFor(publicRoute);
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(verifyAccessToken).not.toHaveBeenCalled();
  });
});
