import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { AuthorizationService } from '../../common/services/authorization.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorization: AuthorizationService,
  ) {}

  private async getThread(threadId: number) {
    const thread = await this.prisma.thread.findFirst({ where: { id: threadId, isDeleted: false } });
    if (!thread) {
      throw new NotFoundException('Thread not found');
    }
    return thread;
  }

  private async getPost(id: number) {
    const post = await this.prisma.post.findFirst({ where: { id, isDeleted: false } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async listPosts(threadId: number, user: AuthenticatedUser) {
    const thread = await this.getThread(threadId);
    await this.authorization.ensureCanAccessGame(user, thread.gameId);
    return this.prisma.post.findMany({
      where: { threadId, isDeleted: false },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createPost(threadId: number, user: AuthenticatedUser, dto: CreatePostDto) {
    const thread = await this.getThread(threadId);
    await this.authorization.ensureCanAccessGame(user, thread.gameId);
    await this.authorization.ensureUserNotBanned(user.id);

    if (thread.isLocked && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Thread is locked');
    }

    return this.prisma.post.create({
      data: {
        threadId,
        authorId: user.id,
        content: dto.content,
      },
    });
  }

  async updatePost(postId: number, user: AuthenticatedUser, dto: UpdatePostDto) {
    const post = await this.getPost(postId);
    const thread = await this.getThread(post.threadId);
    await this.authorization.ensureCanAccessGame(user, thread.gameId);
    this.authorization.ensureAuthorOrAdmin(user, post.authorId);
    return this.prisma.post.update({ where: { id: postId }, data: dto });
  }

  async deletePost(postId: number) {
    await this.getPost(postId);
    return this.prisma.post.update({ where: { id: postId }, data: { isDeleted: true } });
  }

  async setSpoiler(postId: number, isSpoiler: boolean) {
    await this.getPost(postId);
    return this.prisma.post.update({ where: { id: postId }, data: { isSpoiler } });
  }
}
