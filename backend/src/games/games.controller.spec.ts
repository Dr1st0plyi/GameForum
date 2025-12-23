import { GamesController } from './games.controller';
import { GamesService } from './games.service';

describe('GamesController', () => {
  const gamesService = {
    listGames: jest.fn(),
    createGame: jest.fn(),
    updateGame: jest.fn(),
    removeGame: jest.fn(),
  };

  const controller = new GamesController(gamesService as unknown as GamesService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists games with or without user', async () => {
    gamesService.listGames.mockResolvedValue([{ id: 1 }]);
    await expect(controller.listGames(null)).resolves.toEqual([{ id: 1 }]);
    await controller.listGames({ id: 5 } as any);
    expect(gamesService.listGames).toHaveBeenCalledWith(5);
  });

  it('creates game', async () => {
    gamesService.createGame.mockResolvedValue({ id: 1 });
    await expect(controller.createGame({ title: 'Test', steamAppId: 1 })).resolves.toEqual({ id: 1 });
    expect(gamesService.createGame).toHaveBeenCalled();
  });

  it('updates game', async () => {
    gamesService.updateGame.mockResolvedValue({ id: 2 });
    await expect(controller.updateGame(2, { title: 'Updated' })).resolves.toEqual({ id: 2 });
  });

  it('deletes game', async () => {
    gamesService.removeGame.mockResolvedValue({ id: 3 });
    await expect(controller.deleteGame(3)).resolves.toEqual({ id: 3 });
  });
});
