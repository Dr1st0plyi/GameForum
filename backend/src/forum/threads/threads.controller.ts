import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthorizationService } from '../../common/services/authorization.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { SetLockStatusDto } from './dto/set-lock-status.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { ThreadsService } from './threads.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class ThreadsController {
  constructor(
    private readonly threadsService: ThreadsService,
    private readonly authorization: AuthorizationService,
  ) {}

  @Get('games/:gameId/threads')
  async listThreads(@Param('gameId', ParseIntPipe) gameId: number, @CurrentUser() user: AuthenticatedUser) {
    await this.authorization.ensureCanAccessGame(user, gameId);
    return this.threadsService.listGameThreads(gameId);
  }

  @Post('games/:gameId/threads')
  async createThread(
    @Param('gameId', ParseIntPipe) gameId: number,
    @Body() dto: CreateThreadDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.threadsService.createThread(gameId, user, dto);
  }

  @Get('threads/:id')
  async getThread(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    const thread = await this.threadsService.getThread(id);
    await this.authorization.ensureCanAccessGame(user, thread.gameId);
    return thread;
  }

  @Patch('threads/:id')
  async updateThread(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateThreadDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.threadsService.updateThread(id, user, dto);
  }

  @Delete('threads/:id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteThread(@Param('id', ParseIntPipe) id: number) {
    return this.threadsService.deleteThread(id);
  }

  @Patch('threads/:id/lock')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async lockThread(@Param('id', ParseIntPipe) id: number, @Body() dto: SetLockStatusDto) {
    return this.threadsService.lockThread(id, dto.isLocked);
  }
}
