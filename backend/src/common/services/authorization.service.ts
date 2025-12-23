import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';

@Injectable()
export class AuthorizationService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureUserExists(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async ensureUserNotBanned(userId: number) {
    const user = await this.ensureUserExists(userId);
    if (user.isBanned) {
      throw new ForbiddenException('User is banned');
    }
    return user;
  }

  async ensureUserHasGameAccess(userId: number, gameId: number) {
    await this.ensureUserNotBanned(userId);
    const relation = await this.prisma.userGame.findUnique({
      where: { userId_gameId: { userId, gameId } },
    });
    if (!relation) {
      throw new ForbiddenException('Game is not available in user library');
    }
  }

  async ensureDeveloperAssignedToGame(developerId: number, gameId: number) {
    const developer = await this.ensureUserExists(developerId);
    if (developer.role !== UserRole.DEVELOPER && developer.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only developers or admins can perform this action');
    }

    if (developer.role === UserRole.ADMIN) {
      return;
    }

    const assignment = await this.prisma.developerGame.findUnique({
      where: {
        developerId_gameId: {
          developerId,
          gameId,
        },
      },
    });

    if (!assignment) {
      throw new ForbiddenException('Developer is not assigned to this game');
    }
  }

  async ensureCanAccessGame(user: AuthenticatedUser | null, gameId: number) {
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    if (user.role === UserRole.ADMIN) {
      return;
    }

    if (user.role === UserRole.USER) {
      await this.ensureUserHasGameAccess(user.id, gameId);
      return;
    }

    if (user.role === UserRole.DEVELOPER) {
      await this.ensureDeveloperAssignedToGame(user.id, gameId);
      return;
    }

    throw new ForbiddenException('Forbidden');
  }

  ensureAuthorOrAdmin(user: AuthenticatedUser, authorId: number) {
    if (user.role === UserRole.ADMIN || user.id === authorId) {
      return;
    }
    throw new ForbiddenException('Operation not allowed');
  }
}
