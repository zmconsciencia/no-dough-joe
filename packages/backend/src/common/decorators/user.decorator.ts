import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '../types/request-user.interface';

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest<{ user: RequestUser }>();
    return request.user;
  },
);
