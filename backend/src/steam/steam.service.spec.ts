import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { SteamService } from './steam.service';

jest.mock('axios');

const mockedAxios = axios as unknown as { get: jest.Mock };

describe('SteamService', () => {
  const prisma = {
    userGame: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    game: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (operations: any[]) => {
      await Promise.all(operations.map((op: any) => op));
      return [];
    });
  });

  const buildService = (apiKey?: string) =>
    new SteamService(
      { get: jest.fn().mockReturnValue(apiKey) } as unknown as ConfigService,
      prisma as any,
    );

  it('skips sync when api key missing', async () => {
    const service = buildService(undefined);
    const result = await service.syncUserLibrary(1, 'steamId');
    expect(result).toEqual([]);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('clears mappings when no games returned', async () => {
    const service = buildService('key');
    mockedAxios.get.mockResolvedValue({ data: { response: { games: [] } } });
    prisma.userGame.deleteMany.mockResolvedValue({});

    await expect(service.syncUserLibrary(1, 'steamId')).resolves.toEqual([]);
    expect(prisma.userGame.deleteMany).toHaveBeenCalledWith({ where: { userId: 1 } });
  });

  it('handles missing response payload', async () => {
    const service = buildService('key');
    mockedAxios.get.mockResolvedValue({ data: {} });
    prisma.userGame.deleteMany.mockResolvedValue({});

    await expect(service.syncUserLibrary(4, 'steamId')).resolves.toEqual([]);
    expect(prisma.userGame.deleteMany).toHaveBeenCalledWith({ where: { userId: 4 } });
  });

  it('syncs only games existing in database', async () => {
    const service = buildService('key');
    mockedAxios.get.mockResolvedValue({ data: { response: { games: [{ appid: 10 }, { appid: 20 }] } } });
    prisma.game.findMany.mockResolvedValue([{ id: 5, steamAppId: 10 }]);
    prisma.userGame.deleteMany.mockResolvedValue({});
    prisma.userGame.createMany.mockResolvedValue({});

    const result = await service.syncUserLibrary(2, 'steamId');
    expect(result).toEqual([5]);
    expect(prisma.userGame.deleteMany).toHaveBeenCalledWith({ where: { userId: 2, gameId: { notIn: [5] } } });
    expect(prisma.userGame.createMany).toHaveBeenCalledWith({
      data: [{ userId: 2, gameId: 5, lastSyncedAt: expect.any(Date) }],
      skipDuplicates: true,
    });
  });

  it('handles steam api failure gracefully', async () => {
    const service = buildService('key');
    mockedAxios.get.mockRejectedValue(new Error('steam down'));
    await expect(service.syncUserLibrary(3, 'steam')).resolves.toEqual([]);
  });
});
