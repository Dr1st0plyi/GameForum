import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BugReportsService } from './bug-reports.service';
import { AdminReviewBugReportDto } from './dto/admin-review-bug-report.dto';
import { CreateBugReportDto } from './dto/create-bug-report.dto';
import { DeveloperUpdateStatusDto } from './dto/developer-update-status.dto';
import { FilterBugReportsDto } from './dto/filter-bug-reports.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class BugReportsController {
  constructor(private readonly bugReportsService: BugReportsService) {}

  @Post('games/:gameId/bug-reports')
  async createBugReport(
    @Param('gameId', ParseIntPipe) gameId: number,
    @Body() dto: CreateBugReportDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bugReportsService.createBugReport(gameId, user, dto);
  }

  @Get('games/:gameId/bug-reports')
  async listBugReports(
    @Param('gameId', ParseIntPipe) gameId: number,
    @Query() filter: FilterBugReportsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bugReportsService.listBugReports(gameId, user, filter);
  }

  @Get('bug-reports/:id')
  async getBugReport(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.bugReportsService.getBugReport(id, user);
  }

  @Patch('bug-reports/:id/admin-review')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async adminReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminReviewBugReportDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bugReportsService.adminReview(id, user, dto);
  }

  @Patch('bug-reports/:id/status')
  @Roles(UserRole.DEVELOPER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async developerUpdateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DeveloperUpdateStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bugReportsService.developerUpdateStatus(id, user, dto);
  }
}
