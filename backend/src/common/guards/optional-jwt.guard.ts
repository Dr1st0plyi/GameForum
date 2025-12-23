import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const hasAuthHeader = Boolean(req.headers['authorization']);
    if (!hasAuthHeader) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: unknown, user: any) {
    if (err) {
      throw err;
    }
    return user ?? null;
  }
}
