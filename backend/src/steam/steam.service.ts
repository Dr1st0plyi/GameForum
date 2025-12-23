import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

interface SteamOwnedGamesResponse {
  response?: {
    games?: Array<{ appid: number }>; // limited to IDs for syncing
  };
}

@Injectable()
export class SteamService {
  private readonly logger = new Logger(SteamService.name);

  constructor(private readonly configService: ConfigService, private readonly prisma: PrismaService) {}

  async syncUserLibrary(userId: number, steamId: string) {
    const apiKey = this.configService.get<string>('STEAM_API_KEY');
    if (!apiKey) {
      this.logger.warn('STEAM_API_KEY is not defined, skipping Steam sync');
      return [];
    }

    try {
      const { data } = await axios.get<SteamOwnedGamesResponse>(
        'https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/',
        {
          params: {
            key: apiKey,
            steamid: steamId,
            include_appinfo: false,
            format: 'json',
          },
        },
      );

      const games = data.response?.games ?? [];
      const appIds = games.map((game) => game.appid);
      if (appIds.length === 0) {
        await this.prisma.userGame.deleteMany({ where: { userId } });
        return [];
      }

      const existingGames = await this.prisma.game.findMany({
        where: { steamAppId: { in: appIds } },
        select: { id: true },
      });

      const gameIds = existingGames.map((game) => game.id);

      await this.prisma.$transaction([
        this.prisma.userGame.deleteMany({
          where: {
            userId,
            gameId: { notIn: gameIds },
          },
        }),
        this.prisma.userGame.createMany({
          data: gameIds.map((gameId) => ({ userId, gameId, lastSyncedAt: new Date() })),
          skipDuplicates: true,
        }),
      ]);

      return gameIds;
    } catch (error) {
      this.logger.error('Failed to sync Steam library', error as Error);
      // Для учебного проекта не блокируем логин, если Steam API недоступен
      return [];
    }
  }
}
