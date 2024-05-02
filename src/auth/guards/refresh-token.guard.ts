import { ExecutionContext, Injectable } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../constants/auth.constants';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

/**
 * A guard that protects routes by validating the JWT refresh token provided in the request.
 * If the route is marked as public, the guard allows access without token validation.
 * Otherwise, refresh token validation is performed.
 */
@Injectable()
export class RefreshTokenGuard extends AuthGuard('refresh-token') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * Determines whether the current route is accessible without JWT refresh token validation.
   * If the route is marked as public, access is granted without further validation.
   * Otherwise, JWT refresh token validation is performed.
   *
   * @param context The execution context.
   * @returns A boolean indicating whether access is granted.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
