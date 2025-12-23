import { NotFoundException } from '@nestjs/common';
import { GamesService } from './games.service';

describe('GamesService', () => {
  const prisma = {
    game: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
    userGame: {
      findMany: jest.fn(),
    },
  };

  const service = new GamesService(prisma as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists games without user context', async () => {
    prisma.game.findMany.mockResolvedValue([{ id: 1, title: 'Game', steamAppId: 10 }]);
    const games = await service.listGames();

    expect(games).toEqual([{ id: 1, title: 'Game', steamAppId: 10, hasInLibrary: false }]);
  });

  it('lists games with owned flag for current user', async () => {
    prisma.game.findMany.mockResolvedValue([
      { id: 1, title: 'G1', steamAppId: 10 },
      { id: 2, title: 'G2', steamAppId: 11 },
    ]);
    prisma.userGame.findMany.mockResolvedValue([{ gameId: 2 }]);

    const games = await service.listGames(5);
    expect(games).toEqual([
      { id: 1, title: 'G1', steamAppId: 10, hasInLibrary: false },
      { id: 2, title: 'G2', steamAppId: 11, hasInLibrary: true },
    ]);
  });

  it('creates game', async () => {
    prisma.game.create.mockResolvedValue({ id: 1 });
    await expect(service.createGame({ title: 'New', steamAppId: 123 })).resolves.toEqual({ id: 1 });
  });

  it('updates game after existence check', async () => {
    prisma.game.findUnique.mockResolvedValue({ id: 1 });
    prisma.game.update.mockResolvedValue({ id: 1, title: 'Updated' });

    const result = await service.updateGame(1, { title: 'Updated' });
    expect(result.title).toBe('Updated');
  });

  it('throws on update when game missing', async () => {
    prisma.game.findUnique.mockResolvedValue(null);
    await expect(service.updateGame(1, {})).rejects.toBeInstanceOf(NotFoundException);
  });

  it('removes game after validation', async () => {
    prisma.game.findUnique.mockResolvedValue({ id: 1 });
    prisma.game.delete.mockResolvedValue({ id: 1 });
    await expect(service.removeGame(1)).resolves.toEqual({ id: 1 });
  });

  it('throws on delete when game missing', async () => {
    prisma.game.findUnique.mockResolvedValue(null);
    await expect(service.removeGame(9)).rejects.toBeInstanceOf(NotFoundException);
  });
});
