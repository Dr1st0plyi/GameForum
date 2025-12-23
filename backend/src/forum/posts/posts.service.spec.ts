import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { PostsService } from './posts.service';

describe('PostsService', () => {
  const prisma = {
    thread: { findFirst: jest.fn() },
    post: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
  };
  const authorization = {
    ensureCanAccessGame: jest.fn(),
    ensureUserNotBanned: jest.fn(),
    ensureAuthorOrAdmin: jest.fn(),
  };
  const service = new PostsService(prisma as any, authorization as any);
  const user: AuthenticatedUser = { id: 5, role: UserRole.USER, email: null, steamId: 'steam' };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.thread.findFirst.mockResolvedValue({ id: 1, gameId: 2, isLocked: false });
    prisma.post.findFirst.mockResolvedValue({ id: 1, authorId: user.id, threadId: 1, isDeleted: false });
  });

  it('lists posts in thread when user has access', async () => {
    prisma.post.findMany.mockResolvedValue([{ id: 1 }]);
    await expect(service.listPosts(1, user)).resolves.toEqual([{ id: 1 }]);
    expect(authorization.ensureCanAccessGame).toHaveBeenCalledWith(user, 2);
  });

  it('throws when thread missing for list', async () => {
    prisma.thread.findFirst.mockResolvedValue(null);
    await expect(service.listPosts(99, user)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates post', async () => {
    prisma.post.create.mockResolvedValue({ id: 2 });
    await expect(service.createPost(1, user, { content: 'Hi' } as any)).resolves.toEqual({ id: 2 });
    expect(authorization.ensureUserNotBanned).toHaveBeenCalledWith(user.id);
  });

  it('blocks post creation in locked thread for non-admin', async () => {
    prisma.thread.findFirst.mockResolvedValue({ id: 1, gameId: 2, isLocked: true });
    await expect(service.createPost(1, user, { content: 'Hi' } as any)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('updates post when author or admin', async () => {
    prisma.post.update.mockResolvedValue({ id: 1, content: 'Updated' });
    const result = await service.updatePost(1, user, { content: 'Updated' } as any);
    expect(result.content).toBe('Updated');
    expect(authorization.ensureAuthorOrAdmin).toHaveBeenCalledWith(user, user.id);
  });

  it('throws when post not found', async () => {
    prisma.post.findFirst.mockResolvedValue(null);
    await expect(service.updatePost(55, user, { content: 'x' } as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('soft deletes post', async () => {
    prisma.post.update.mockResolvedValue({ id: 1, isDeleted: true });
    await expect(service.deletePost(1)).resolves.toEqual({ id: 1, isDeleted: true });
    expect(prisma.post.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { isDeleted: true } });
  });

  it('marks post as spoiler', async () => {
    prisma.post.update.mockResolvedValue({ id: 1, isSpoiler: true });
    await expect(service.setSpoiler(1, true)).resolves.toEqual({ id: 1, isSpoiler: true });
    expect(prisma.post.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { isSpoiler: true } });
  });
});
