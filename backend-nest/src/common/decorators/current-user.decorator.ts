import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Extract authenticated user from the request (populated by JWT strategy later). */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
