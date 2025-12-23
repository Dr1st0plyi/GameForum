import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OptionalJwtAuthGuard } from './optional-jwt.guard';
import { RolesGuard } from './roles.guard';

describe('JwtAuthGuard', () => {
  it('creates guard instance', () => {
    expect(new JwtAuthGuard()).toBeInstanceOf(JwtAuthGuard);
  });
});

describe('OptionalJwtAuthGuard', () => {
  it('allows unauthenticated requests when header missing', () => {
    const guard = new OptionalJwtAuthGuard();
    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('delegates to base AuthGuard when Authorization header present', async () => {
    const basePrototype = Object.getPrototypeOf(OptionalJwtAuthGuard.prototype) as any;
    const superSpy = jest.spyOn(basePrototype, 'canActivate').mockResolvedValue(true as any);
    const guard = new OptionalJwtAuthGuard();

    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({ headers: { authorization: 'Bearer token' } }) }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(superSpy).toHaveBeenCalled();
    superSpy.mockRestore();
  });

  it('handleRequest bubbles up errors', () => {
    const guard = new OptionalJwtAuthGuard();
    expect(() => guard.handleRequest(new Error('boom'), null)).toThrow('boom');
  });

  it('handleRequest returns user or null gracefully', () => {
    const guard = new OptionalJwtAuthGuard();
    expect(guard.handleRequest(null as any, { id: 1 })).toEqual({ id: 1 });
    expect(guard.handleRequest(null as any, null as any)).toBeNull();
  });
});

describe('RolesGuard', () => {
  const buildContext = (user?: any): ExecutionContext =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    }) as unknown as ExecutionContext;

  it('passes through when no roles are set', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(undefined) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(buildContext())).toBe(true);
  });

  it('denies when user missing', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue([UserRole.ADMIN]) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(buildContext(undefined))).toBe(false);
  });

  it('allows only when roles match', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue([UserRole.ADMIN]) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(buildContext({ role: UserRole.ADMIN }))).toBe(true);
    expect(guard.canActivate(buildContext({ role: UserRole.USER }))).toBe(false);
  });
});
