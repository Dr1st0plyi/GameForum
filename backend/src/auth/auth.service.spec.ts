import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

jest.mock('bcrypt');

describe('AuthService', () => {
  const usersService = {
    findByEmail: jest.fn(),
    findBySteamId: jest.fn(),
  };
  const prisma = {
    user: { create: jest.fn() },
  };
  const steamService = {
    syncUserLibrary: jest.fn(),
  };

  const jwtService = new JwtService({ secret: 'test-secret' });
  const service = new AuthService(usersService as any, prisma as any, jwtService, steamService as any);
  const compareMock = bcrypt.compare as jest.Mock;

  const buildUser = (overrides?: Partial<AuthenticatedUser> & { passwordHash?: string }) =>
    ({
      id: overrides?.id ?? 1,
      email: overrides?.email ?? 'admin@test',
      steamId: overrides?.steamId ?? null,
      role: overrides?.role ?? UserRole.ADMIN,
      passwordHash: overrides?.passwordHash ?? 'hash',
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
    compareMock.mockReset();
  });

  it('validates local user credentials', async () => {
    const user = buildUser();
    usersService.findByEmail.mockResolvedValue(user);
    compareMock.mockImplementation(async () => true);

    await expect(service.validateLocalUser(user.email, 'password')).resolves.toEqual(user);
  });

  it('rejects when email missing or password invalid', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    await expect(service.validateLocalUser('missing@test', 'pass')).rejects.toBeInstanceOf(UnauthorizedException);

    const user = buildUser();
    usersService.findByEmail.mockResolvedValue(user);
    compareMock.mockImplementation(async () => false);
    await expect(service.validateLocalUser(user.email, 'wrong')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects login for USER role with local strategy', async () => {
    const user = buildUser({ role: UserRole.USER });
    usersService.findByEmail.mockResolvedValue(user);
    compareMock.mockImplementation(async () => true);
    await expect(service.validateLocalUser(user.email, 'pass')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('handles steam login for new user', async () => {
    usersService.findBySteamId.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(buildUser({ id: 10, role: UserRole.USER, email: null, steamId: 'sid' }));

    const user = await service.handleSteamLogin({ id: 'sid', displayName: 'SteamUser' });
    expect(user.id).toBe(10);
    expect(steamService.syncUserLibrary).toHaveBeenCalledWith(10, 'sid');
  });

  it('uses existing steam user if present', async () => {
    const existing = buildUser({ id: 4, role: UserRole.USER, email: null, steamId: 'sid' });
    usersService.findBySteamId.mockResolvedValue(existing);

    const user = await service.handleSteamLogin({ id: 'sid', displayName: 'SteamUser' });
    expect(user).toEqual(existing);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('throws for invalid steam profile', async () => {
    await expect(service.handleSteamLogin({ id: '', displayName: 'bad' })).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('builds authenticated user projection', () => {
    const user = buildUser({ steamId: 'sid' });
    expect(service.buildAuthenticatedUser(user)).toEqual({
      id: user.id,
      email: user.email,
      steamId: 'sid',
      role: user.role,
    });
  });

  it('returns jwt token and user payload on login', async () => {
    const user = buildUser({ id: 7 });
    const result = await service.login(user as any);
    expect(typeof result.accessToken).toBe('string');
    const decoded = jwtService.decode(result.accessToken) as any;
    expect(decoded.sub).toBe(7);
    expect(result.user.id).toBe(7);
  });
});
