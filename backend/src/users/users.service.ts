import { Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findBySteamId(steamId: string) {
    return this.prisma.user.findUnique({ where: { steamId } });
  }

  async createSteamUser(data: { steamId: string; personaName?: string | null }) {
    return this.prisma.user.create({
      data: {
        steamId: data.steamId,
        role: UserRole.USER,
        email: null,
        passwordHash: null,
      },
    });
  }

  async updateUser(userId: number, payload: Prisma.UserUpdateInput) {
    return this.prisma.user.update({ where: { id: userId }, data: payload });
  }

  async listUsers(params: { skip?: number; take?: number }) {
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return { items, total };
  }

  async banUser(userId: number) {
    return this.prisma.user.update({ where: { id: userId }, data: { isBanned: true } });
  }

  async unbanUser(userId: number) {
    return this.prisma.user.update({ where: { id: userId }, data: { isBanned: false } });
  }
}
