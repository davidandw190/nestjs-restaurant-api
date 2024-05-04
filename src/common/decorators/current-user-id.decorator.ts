import { ExecutionContext, createParamDecorator } from '@nestjs/common';
/**
 * Custom param decorator to extract the subject from the current user's token payload.
 *
 * @param context - ExecutionContext containing information about the current request.
 * @returns The subject (sub) from the current user's token payload.
 */
export const CurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user.sub;
  },
);
