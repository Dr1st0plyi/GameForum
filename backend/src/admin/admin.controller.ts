import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UsersService } from '../users/users.service';
import { UpdateBanStatusDto } from './dto/update-ban-status.dto';
import { BugReportsService } from '../bug-reports/bug-reports.service';

@Controller('admin')
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly usersService: UsersService, private readonly bugReportsService: BugReportsService) {}

  @Get('users')
  async listUsers(@Query() query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    return this.usersService.listUsers({ skip: (page - 1) * pageSize, take: pageSize });
  }

  @Patch('users/:id/ban')
  async updateBanStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBanStatusDto,
  ) {
    return dto.isBanned ? this.usersService.banUser(id) : this.usersService.unbanUser(id);
  }

  @Get('bug-reports/pending')
  async pendingBugReports() {
    return this.bugReportsService.listPendingForAdmin();
  }
}
