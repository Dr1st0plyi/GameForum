import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PostsController } from './posts/posts.controller';
import { ThreadsController } from './threads/threads.controller';

describe('Forum controllers', () => {
  const threadsService = {
    listGameThreads: jest.fn(),
    createThread: jest.fn(),
    getThread: jest.fn(),
    updateThread: jest.fn(),
    deleteThread: jest.fn(),
    lockThread: jest.fn(),
  };
  const postsService = {
    listPosts: jest.fn(),
    createPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
    setSpoiler: jest.fn(),
  };
  const authorization = { ensureCanAccessGame: jest.fn() };

  const threadsController = new ThreadsController(threadsService as any, authorization as any);
  const postsController = new PostsController(postsService as any);

  const user: AuthenticatedUser = { id: 1, role: UserRole.USER, email: null, steamId: 'steam' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists threads for game', async () => {
    threadsService.listGameThreads.mockResolvedValue([{ id: 1 }]);
    await expect(threadsController.listThreads(10, user)).resolves.toEqual([{ id: 1 }]);
    expect(authorization.ensureCanAccessGame).toHaveBeenCalledWith(user, 10);
  });

  it('creates thread', async () => {
    threadsService.createThread.mockResolvedValue({ id: 2 });
    await expect(threadsController.createThread(5, { title: 't', content: 'c' } as any, user)).resolves.toEqual({ id: 2 });
  });

  it('gets thread with access validation', async () => {
    threadsService.getThread.mockResolvedValue({ id: 3, gameId: 4 });
    await expect(threadsController.getThread(3, user)).resolves.toEqual({ id: 3, gameId: 4 });
    expect(authorization.ensureCanAccessGame).toHaveBeenCalledWith(user, 4);
  });

  it('updates thread', async () => {
    threadsService.updateThread.mockResolvedValue({ id: 3 });
    await expect(threadsController.updateThread(3, { title: 'x' } as any, user)).resolves.toEqual({ id: 3 });
  });

  it('deletes thread and locks thread', async () => {
    threadsService.deleteThread.mockResolvedValue({ success: true });
    threadsService.lockThread.mockResolvedValue({ id: 4, isLocked: true });
    await expect(threadsController.deleteThread(9)).resolves.toEqual({ success: true });
    await expect(threadsController.lockThread(4, { isLocked: true } as any)).resolves.toEqual({ id: 4, isLocked: true });
  });

  it('lists and mutates posts', async () => {
    postsService.listPosts.mockResolvedValue([{ id: 1 }]);
    await expect(postsController.listPosts(1, user)).resolves.toEqual([{ id: 1 }]);

    postsService.createPost.mockResolvedValue({ id: 2 });
    await expect(postsController.createPost(1, { content: 'text' } as any, user)).resolves.toEqual({ id: 2 });

    postsService.updatePost.mockResolvedValue({ id: 3 });
    await expect(postsController.updatePost(3, { content: 'upd' } as any, user)).resolves.toEqual({ id: 3 });

    postsService.deletePost.mockResolvedValue({ id: 4 });
    await expect(postsController.deletePost(4)).resolves.toEqual({ id: 4 });

    postsService.setSpoiler.mockResolvedValue({ id: 5, isSpoiler: true });
    await expect(postsController.setSpoiler(5, { isSpoiler: true } as any)).resolves.toEqual({
      id: 5,
      isSpoiler: true,
    });
  });
});
