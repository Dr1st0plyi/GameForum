import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BugReportStatus, UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { AuthorizationService } from '../common/services/authorization.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminBugReportAction, AdminReviewBugReportDto } from './dto/admin-review-bug-report.dto';
import { CreateBugReportDto } from './dto/create-bug-report.dto';
import { DeveloperUpdateStatusDto } from './dto/developer-update-status.dto';
import { FilterBugReportsDto } from './dto/filter-bug-reports.dto';

const PUBLIC_STATUSES: BugReportStatus[] = [
  BugReportStatus.VISIBLE_TO_DEV,
  BugReportStatus.IN_PROGRESS,
  BugReportStatus.FIXED,
  BugReportStatus.CLOSED,
];
const ADMIN_ONLY_STATUSES: BugReportStatus[] = [BugReportStatus.PENDING_ADMIN, BugReportStatus.REJECTED_BY_ADMIN];

@Injectable()
export class BugReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorization: AuthorizationService,
  ) {}

  private async getBugReportOrThrow(id: number) {
    const report = await this.prisma.bugReport.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException('Bug report not found');
    }
    return report;
  }

  async createBugReport(gameId: number, user: AuthenticatedUser, dto: CreateBugReportDto) {
    await this.authorization.ensureCanAccessGame(user, gameId);
    await this.authorization.ensureUserNotBanned(user.id);

    return this.prisma.bugReport.create({
      data: {
        gameId,
        authorId: user.id,
        title: dto.title,
        description: dto.description,
        status: BugReportStatus.PENDING_ADMIN,
      },
    });
  }

  async listBugReports(gameId: number, user: AuthenticatedUser, filter: FilterBugReportsDto) {
    await this.authorization.ensureCanAccessGame(user, gameId);

    const where: Record<string, unknown> = { gameId };

    if (user.role === UserRole.USER) {
      where['OR'] = [
        { authorId: user.id },
        { status: { in: PUBLIC_STATUSES } },
      ];
    }

    if (filter.status) {
      if (user.role === UserRole.DEVELOPER && ADMIN_ONLY_STATUSES.includes(filter.status)) {
        throw new ForbiddenException('Status not visible to developers');
      }
      where['status'] = filter.status;
    } else if (user.role === UserRole.DEVELOPER) {
      where['status'] = { notIn: ADMIN_ONLY_STATUSES };
    }

    return this.prisma.bugReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, email: true, steamId: true, role: true },
        },
      },
    });
  }

  async getBugReport(id: number, user: AuthenticatedUser) {
    const report = await this.prisma.bugReport.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, email: true, steamId: true, role: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
        },
        statusLog: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Bug report not found');
    }

    await this.ensureVisibility(report, user);
    return report;
  }

  listPendingForAdmin() {
    return this.prisma.bugReport.findMany({
      where: { status: BugReportStatus.PENDING_ADMIN },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, email: true, steamId: true, role: true } },
        game: { select: { id: true, title: true } },
      },
    });
  }

  private async ensureVisibility(report: { gameId: number; authorId: number; status: BugReportStatus }, user: AuthenticatedUser) {
    await this.authorization.ensureCanAccessGame(user, report.gameId);

    if (user.role === UserRole.ADMIN) {
      return;
    }

    if (user.role === UserRole.DEVELOPER) {
      if (ADMIN_ONLY_STATUSES.includes(report.status)) {
        throw new ForbiddenException('Bug report hidden from developer');
      }
      return;
    }

    if (user.role === UserRole.USER && report.authorId !== user.id && !PUBLIC_STATUSES.includes(report.status)) {
      throw new ForbiddenException('Bug report hidden');
    }
  }

  async adminReview(id: number, admin: AuthenticatedUser, dto: AdminReviewBugReportDto) {
    const report = await this.getBugReportOrThrow(id);

    if (report.status !== BugReportStatus.PENDING_ADMIN) {
      throw new ForbiddenException('Bug report already reviewed');
    }

    const newStatus =
      dto.action === AdminBugReportAction.APPROVE
        ? BugReportStatus.VISIBLE_TO_DEV
        : BugReportStatus.REJECTED_BY_ADMIN;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.bugReport.update({
        where: { id },
        data: { status: newStatus },
      });
      await tx.bugReportStatusChange.create({
        data: {
          bugReportId: id,
          changedById: admin.id,
          oldStatus: report.status,
          newStatus,
        },
      });
      if (dto.comment) {
        await tx.bugReportComment.create({
          data: {
            bugReportId: id,
            authorId: admin.id,
            content: dto.comment,
          },
        });
      }
      return updated;
    });
  }

  async developerUpdateStatus(id: number, user: AuthenticatedUser, dto: DeveloperUpdateStatusDto) {
    const report = await this.getBugReportOrThrow(id);
    await this.authorization.ensureDeveloperAssignedToGame(user.id, report.gameId);

    if (report.status === BugReportStatus.PENDING_ADMIN || report.status === BugReportStatus.REJECTED_BY_ADMIN) {
      throw new ForbiddenException('Bug report not visible to developer');
    }

    const allowedTransitions: Record<BugReportStatus, BugReportStatus[]> = {
      [BugReportStatus.VISIBLE_TO_DEV]: [BugReportStatus.IN_PROGRESS, BugReportStatus.FIXED, BugReportStatus.CLOSED],
      [BugReportStatus.IN_PROGRESS]: [BugReportStatus.FIXED, BugReportStatus.CLOSED],
      [BugReportStatus.FIXED]: [],
      [BugReportStatus.CLOSED]: [],
      [BugReportStatus.PENDING_ADMIN]: [],
      [BugReportStatus.REJECTED_BY_ADMIN]: [],
    };

    const canTransition = allowedTransitions[report.status].includes(dto.status);
    if (!canTransition) {
      throw new ForbiddenException('Invalid status transition');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.bugReport.update({ where: { id }, data: { status: dto.status } });
      await tx.bugReportStatusChange.create({
        data: {
          bugReportId: id,
          changedById: user.id,
          oldStatus: report.status,
          newStatus: dto.status,
        },
      });
      return updated;
    });
  }
}
