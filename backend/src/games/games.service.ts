import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  async listGames(currentUserId?: number) {
    const games = await this.prisma.game.findMany({
      orderBy: { title: 'asc' },
    });

    if (!currentUserId) {
      return games.map((game) => ({ ...game, hasInLibrary: false }));
    }

    const ownedGames = await this.prisma.userGame.findMany({
      where: { userId: currentUserId },
      select: { gameId: true },
    });

    const ownedMap = new Set(ownedGames.map((item) => item.gameId));

    return games.map((game) => ({
      ...game,
      hasInLibrary: ownedMap.has(game.id),
    }));
  }

  async createGame(data: Prisma.GameCreateInput) {
    return this.prisma.game.create({ data });
  }

  async updateGame(id: number, data: Prisma.GameUpdateInput) {
    const exists = await this.prisma.game.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException('Game not found');
    }
    return this.prisma.game.update({ where: { id }, data });
  }

  async removeGame(id: number) {
    const exists = await this.prisma.game.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException('Game not found');
    }
    return this.prisma.game.delete({ where: { id } });
  }
}
