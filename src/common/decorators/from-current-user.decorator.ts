import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { TokenPayload } from 'src/auth/types/jwt-token.payload';

/**
 * Custom param decorator to extract data from the current user's token payload.
 * If no specific data key is provided, returns the entire user payload.
 *
 * @param data - Optional key of the user payload to extract.
 * @param context - ExecutionContext containing information about the current request.
 * @returns The specified data from the current user's token payload, or the entire
 * payload if no key is provided.
 */
export const FromCurrentUser = createParamDecorator(
  (data: keyof TokenPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    return request.user[data];
  },
);
