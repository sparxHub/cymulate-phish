import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Location = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return (req as any).location;
  },
);
