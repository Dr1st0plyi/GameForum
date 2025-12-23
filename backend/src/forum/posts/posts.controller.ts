import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { SetSpoilerDto } from './dto/set-spoiler.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('threads/:threadId/posts')
  async listPosts(
    @Param('threadId', ParseIntPipe) threadId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.postsService.listPosts(threadId, user);
  }

  @Post('threads/:threadId/posts')
  async createPost(
    @Param('threadId', ParseIntPipe) threadId: number,
    @Body() dto: CreatePostDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.postsService.createPost(threadId, user, dto);
  }

  @Patch('posts/:id')
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.postsService.updatePost(id, user, dto);
  }

  @Delete('posts/:id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }

  @Patch('posts/:id/spoiler')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async setSpoiler(@Param('id', ParseIntPipe) id: number, @Body() dto: SetSpoilerDto) {
    return this.postsService.setSpoiler(id, dto.isSpoiler);
  }
}
