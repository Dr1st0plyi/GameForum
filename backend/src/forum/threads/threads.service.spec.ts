import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { ThreadsService } from './threads.service';

describe('ThreadsService', () => {
  const prisma = {
    thread: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const authorization = {
    ensureCanAccessGame: jest.fn(),
    ensureUserNotBanned: jest.fn(),
    ensureAuthorOrAdmin: jest.fn(),
  };

  const service = new ThreadsService(prisma as any, authorization as any);

  const user: AuthenticatedUser = { id: 1, role: UserRole.USER, email: null, steamId: 'steam' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists game threads', async () => {
    prisma.thread.findMany.mockResolvedValue([{ id: 1 }]);
    await expect(service.listGameThreads(5)).resolves.toEqual([{ id: 1 }]);
    expect(prisma.thread.findMany).toHaveBeenCalledWith({
      where: { gameId: 5, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('gets thread or throws', async () => {
    prisma.thread.findFirst.mockResolvedValue({ id: 1 });
    await expect(service.getThread(1)).resolves.toEqual({ id: 1 });

    prisma.thread.findFirst.mockResolvedValue(null);
    await expect(service.getThread(2)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates thread with initial post', async () => {
    prisma.thread.findFirst.mockResolvedValue({ id: 1, authorId: 1, gameId: 2, isLocked: false });
    prisma.thread.create.mockResolvedValue({ id: 10 });
    const dto = { title: 't', content: 'first' };

    await expect(service.createThread(2, user, dto)).resolves.toEqual({ id: 10 });
    expect(authorization.ensureCanAccessGame).toHaveBeenCalledWith(user, 2);
    expect(authorization.ensureUserNotBanned).toHaveBeenCalledWith(user.id);
    expect(prisma.thread.create).toHaveBeenCalled();
  });

  it('updates thread when allowed', async () => {
    prisma.thread.findFirst.mockResolvedValue({ id: 1, authorId: 1, gameId: 2, isLocked: false });
    prisma.thread.update.mockResolvedValue({ id: 1, title: 'new' });
    const dto = { title: 'new' };

    const result = await service.updateThread(1, user, dto as any);
    expect(result.title).toBe('new');
    expect(authorization.ensureAuthorOrAdmin).toHaveBeenCalledWith(user, 1);
  });

  it('blocks updates to locked threads for non-admin', async () => {
    prisma.thread.findFirst.mockResolvedValue({ id: 1, authorId: 1, gameId: 2, isLocked: true });
    await expect(service.updateThread(1, user, { title: 'x' } as any)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('soft deletes thread', async () => {
    prisma.thread.findFirst.mockResolvedValue({ id: 1, authorId: 1, gameId: 2, isLocked: false });
    prisma.thread.update.mockResolvedValue({ id: 1, isDeleted: true });

    await expect(service.deleteThread(1)).resolves.toEqual({ id: 1, isDeleted: true });
    expect(prisma.thread.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { isDeleted: true } });
  });

  it('locks and unlocks thread', async () => {
    prisma.thread.findFirst.mockResolvedValue({ id: 1, authorId: 1, gameId: 2, isLocked: false });
    prisma.thread.update.mockResolvedValue({ id: 1, isLocked: true });

    await expect(service.lockThread(1, true)).resolves.toEqual({ id: 1, isLocked: true });
    expect(prisma.thread.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { isLocked: true } });
  });
});
