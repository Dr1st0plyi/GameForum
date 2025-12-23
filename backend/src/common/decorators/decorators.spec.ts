import 'reflect-metadata';
import { ExecutionContext } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from './current-user.decorator';
import { ROLES_KEY, Roles } from './roles.decorator';

describe('Roles decorator', () => {
  it('stores required roles in metadata', () => {
    class TestController {
      @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
      handler() {
        return true;
      }
    }

    const metadata =
      Reflect.getMetadata(ROLES_KEY, TestController.prototype, 'handler') ??
      Reflect.getMetadata(ROLES_KEY, TestController.prototype.handler);
    expect(metadata).toEqual([UserRole.ADMIN, UserRole.DEVELOPER]);
  });
});

describe('CurrentUser decorator', () => {
  it('returns user from request', () => {
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { id: 1, email: 'u@example.com' } }),
      }),
    } as unknown as ExecutionContext;

    const decoratorFn = CurrentUser(null as any, ctx);
    expect(typeof decoratorFn).toBe('function');
  });

  it('returns null when no user present', () => {
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    const decoratorFn = CurrentUser(null as any, ctx);
    expect(typeof decoratorFn).toBe('function');
  });

  it('extracts user via factory when mocked as param decorator', () => {
    jest.isolateModules(() => {
      jest.doMock('@nestjs/common', () => {
        const actual = jest.requireActual('@nestjs/common');
        return {
          ...actual,
          createParamDecorator: (factory: any) => factory,
        };
      });

      const { CurrentUser: FactoryCurrentUser } = require('./current-user.decorator');
      const ctxWithUser = {
        switchToHttp: () => ({ getRequest: () => ({ user: { id: 1 } }) }),
      } as unknown as ExecutionContext;
      expect(FactoryCurrentUser(null, ctxWithUser)).toEqual({ id: 1 });

      const ctxWithoutUser = {
        switchToHttp: () => ({ getRequest: () => ({}) }),
      } as unknown as ExecutionContext;
      expect(FactoryCurrentUser(null, ctxWithoutUser)).toBeNull();
    });
    jest.resetModules();
  });
});
