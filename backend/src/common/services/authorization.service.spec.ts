import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthorizationService } from './authorization.service';

describe('AuthorizationService', () => {
  const prisma = {
    user: { findUnique: jest.fn() },
    userGame: { findUnique: jest.fn() },
    developerGame: { findUnique: jest.fn() },
  };

  const service = new AuthorizationService(prisma as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const buildUser = (overrides?: Partial<{ isBanned: boolean; role: UserRole }>) => ({
    id: 1,
    email: 'test@example.com',
    passwordHash: 'hash',
    steamId: null,
    role: overrides?.role ?? UserRole.USER,
    isBanned: overrides?.isBanned ?? false,
  });

  it('ensures user exists', async () => {
    const user = buildUser();
    prisma.user.findUnique.mockResolvedValue(user);

    await expect(service.ensureUserExists(user.id)).resolves.toEqual(user);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: user.id } });
  });

  it('throws when user missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.ensureUserExists(42)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('ensures user not banned', async () => {
    prisma.user.findUnique.mockResolvedValue(buildUser());
    await expect(service.ensureUserNotBanned(1)).resolves.toEqual(buildUser());
  });

  it('throws when user banned', async () => {
    prisma.user.findUnique.mockResolvedValue(buildUser({ isBanned: true }));
    await expect(service.ensureUserNotBanned(1)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('validates user game access', async () => {
    prisma.user.findUnique.mockResolvedValue(buildUser());
    prisma.userGame.findUnique.mockResolvedValue({ userId: 1, gameId: 10 });

    await expect(service.ensureUserHasGameAccess(1, 10)).resolves.toBeUndefined();
    expect(prisma.userGame.findUnique).toHaveBeenCalledWith({ where: { userId_gameId: { userId: 1, gameId: 10 } } });
  });

  it('blocks access when relation missing', async () => {
    prisma.user.findUnique.mockResolvedValue(buildUser());
    prisma.userGame.findUnique.mockResolvedValue(null);

    await expect(service.ensureUserHasGameAccess(1, 2)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('blocks access when user banned before relation check', async () => {
    prisma.user.findUnique.mockResolvedValue(buildUser({ isBanned: true }));
    await expect(service.ensureUserHasGameAccess(1, 2)).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.userGame.findUnique).not.toHaveBeenCalled();
  });

  it('allows admin developer assignment skip', async () => {
    prisma.user.findUnique.mockResolvedValue(buildUser({ role: UserRole.ADMIN }));
    await expect(service.ensureDeveloperAssignedToGame(5, 9)).resolves.toBeUndefined();
    expect(prisma.developerGame.findUnique).not.toHaveBeenCalled();
  });

  it('validates developer assignment', async () => {
    prisma.user.findUnique.mockResolvedValue(buildUser({ role: UserRole.DEVELOPER }));
    prisma.developerGame.findUnique.mockResolvedValue({ developerId: 2, gameId: 3 });

    await expect(service.ensureDeveloperAssignedToGame(2, 3)).resolves.toBeUndefined();
    expect(prisma.developerGame.findUnique).toHaveBeenCalledWith({
      where: { developerId_gameId: { developerId: 2, gameId: 3 } },
    });
  });

  it('blocks developer when not assigned', async () => {
    prisma.user.findUnique.mockResolvedValue(buildUser({ role: UserRole.DEVELOPER }));
    prisma.developerGame.findUnique.mockResolvedValue(null);

    await expect(service.ensureDeveloperAssignedToGame(2, 3)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects non-developer roles for developer actions', async () => {
    prisma.user.findUnique.mockResolvedValue(buildUser({ role: UserRole.USER }));
    await expect(service.ensureDeveloperAssignedToGame(2, 3)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('checks access for different roles', async () => {
    const userAccessSpy = jest.spyOn(service, 'ensureUserHasGameAccess');
    const developerAccessSpy = jest.spyOn(service, 'ensureDeveloperAssignedToGame');

    await expect(service.ensureCanAccessGame(null, 1)).rejects.toBeInstanceOf(ForbiddenException);

    await expect(service.ensureCanAccessGame(buildUser({ role: UserRole.ADMIN }), 1)).resolves.toBeUndefined();

    prisma.user.findUnique.mockResolvedValue(buildUser());
    prisma.userGame.findUnique.mockResolvedValue({ userId: 1, gameId: 1 });
    await expect(service.ensureCanAccessGame(buildUser(), 1)).resolves.toBeUndefined();
    expect(userAccessSpy).toHaveBeenCalled();

    prisma.user.findUnique.mockResolvedValue(buildUser({ role: UserRole.DEVELOPER }));
    prisma.developerGame.findUnique.mockResolvedValue({ developerId: 1, gameId: 2 });
    await expect(service.ensureCanAccessGame(buildUser({ role: UserRole.DEVELOPER }), 2)).resolves.toBeUndefined();
    expect(developerAccessSpy).toHaveBeenCalled();

    await expect(
      service.ensureCanAccessGame({ id: 1, role: 'UNKNOWN' as UserRole, email: null, steamId: null }, 3),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('checks author or admin rule', () => {
    expect(() => service.ensureAuthorOrAdmin(buildUser(), 1)).not.toThrow();
    expect(() =>
      service.ensureAuthorOrAdmin(buildUser({ role: UserRole.ADMIN }), 2),
    ).not.toThrow();
    expect(() => service.ensureAuthorOrAdmin(buildUser(), 3)).toThrow(ForbiddenException);
  });
});
