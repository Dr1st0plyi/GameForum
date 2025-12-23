import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BugReportsService } from '../bug-reports/bug-reports.service';
import { FilterBugReportsDto } from '../bug-reports/dto/filter-bug-reports.dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller('developer')
@Roles(UserRole.DEVELOPER)
@UseGuards(JwtAuthGuard, RolesGuard)
export class DevelopersController {
  constructor(private readonly prisma: PrismaService, private readonly bugReportsService: BugReportsService) {}

  @Get('games')
  async listAssignedGames(@CurrentUser() user: AuthenticatedUser) {
    return this.prisma.game.findMany({
      where: { developerGames: { some: { developerId: user.id } } },
      orderBy: { title: 'asc' },
    });
  }

  @Get('games/:gameId/bug-reports')
  async listBugReportsForGame(
    @Param('gameId', ParseIntPipe) gameId: number,
    @Query() filter: FilterBugReportsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bugReportsService.listBugReports(gameId, user, filter);
  }
}
