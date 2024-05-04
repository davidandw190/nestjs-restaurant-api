import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';

/**
 * Custom param decorator to extract the HTTP-only refresh token from the request.
 *
 * @param context - ExecutionContext containing information about the current request.
 * @returns The extracted refresh token from the request.
 */
export const ExtractRefreshToken = createParamDecorator(
  (_: undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    return refreshToken;
  },
);
