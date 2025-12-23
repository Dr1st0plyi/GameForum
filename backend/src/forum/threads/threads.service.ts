import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { CreateThreadDto } from './dto/create-thread.dto';
import { AuthorizationService } from '../../common/services/authorization.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateThreadDto } from './dto/update-thread.dto';

@Injectable()
export class ThreadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorization: AuthorizationService,
  ) {}

  async listGameThreads(gameId: number) {
    return this.prisma.thread.findMany({
      where: { gameId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getThread(id: number) {
    const thread = await this.prisma.thread.findFirst({
      where: { id, isDeleted: false },
    });
    if (!thread) {
      throw new NotFoundException('Thread not found');
    }
    return thread;
  }

  async createThread(gameId: number, user: AuthenticatedUser, dto: CreateThreadDto) {
    await this.authorization.ensureCanAccessGame(user, gameId);
    await this.authorization.ensureUserNotBanned(user.id);

    return this.prisma.thread.create({
      data: {
        gameId,
        authorId: user.id,
        title: dto.title,
        posts: {
          create: {
            authorId: user.id,
            content: dto.content,
          },
        },
      },
    });
  }

  async updateThread(id: number, user: AuthenticatedUser, data: UpdateThreadDto) {
    const thread = await this.getThread(id);
    this.authorization.ensureAuthorOrAdmin(user, thread.authorId);
    if (thread.isLocked && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Thread is locked');
    }

    return this.prisma.thread.update({ where: { id }, data });
  }

  async deleteThread(id: number) {
    await this.getThread(id);
    return this.prisma.thread.update({ where: { id }, data: { isDeleted: true } });
  }

  async lockThread(id: number, isLocked: boolean) {
    await this.getThread(id);
    return this.prisma.thread.update({ where: { id }, data: { isLocked } });
  }
}
