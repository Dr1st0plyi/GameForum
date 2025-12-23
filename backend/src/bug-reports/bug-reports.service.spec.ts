import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BugReportStatus, UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { BugReportsService } from './bug-reports.service';
import { AdminBugReportAction } from './dto/admin-review-bug-report.dto';

describe('BugReportsService', () => {
  const prisma = {
    bugReport: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    bugReportStatusChange: {
      create: jest.fn(),
    },
    bugReportComment: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const authorization = {
    ensureCanAccessGame: jest.fn(),
    ensureUserNotBanned: jest.fn(),
    ensureDeveloperAssignedToGame: jest.fn(),
  };

  const service = new BugReportsService(prisma as any, authorization as any);

  const user: AuthenticatedUser = { id: 1, role: UserRole.USER, email: null, steamId: 'steam' };
  const developer: AuthenticatedUser = { id: 2, role: UserRole.DEVELOPER, email: 'dev@test', steamId: null };
  const admin: AuthenticatedUser = { id: 3, role: UserRole.ADMIN, email: 'admin@test', steamId: null };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (cb: any) => cb(prisma));
  });

  it('creates bug report with pending status', async () => {
    prisma.bugReport.create.mockResolvedValue({ id: 10 });
    await expect(service.createBugReport(5, user, { title: 'Bug', description: 'Details' })).resolves.toEqual({
      id: 10,
    });
    expect(authorization.ensureCanAccessGame).toHaveBeenCalledWith(user, 5);
    expect(authorization.ensureUserNotBanned).toHaveBeenCalledWith(user.id);
  });

  it('lists bug reports for user with visibility rules', async () => {
    prisma.bugReport.findMany.mockResolvedValue([]);
    await service.listBugReports(1, user, {});
    expect(prisma.bugReport.findMany).toHaveBeenCalled();
    const where = prisma.bugReport.findMany.mock.calls[0][0].where;
    expect(where.OR).toBeDefined();
  });

  it('filters bug reports for developer', async () => {
    prisma.bugReport.findMany.mockResolvedValue([]);
    await service.listBugReports(1, developer, {});
    const where = prisma.bugReport.findMany.mock.calls[0][0].where;
    expect(where.status.notIn).toEqual([BugReportStatus.PENDING_ADMIN, BugReportStatus.REJECTED_BY_ADMIN]);
  });

  it('prevents developer from requesting admin-only status', async () => {
    await expect(
      service.listBugReports(1, developer, { status: BugReportStatus.PENDING_ADMIN }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows admin filter passthrough', async () => {
    prisma.bugReport.findMany.mockResolvedValue([{ id: 1 }]);
    const results = await service.listBugReports(1, admin, { status: BugReportStatus.CLOSED });
    expect(results).toEqual([{ id: 1 }]);
  });

  it('gets bug report with visibility checks', async () => {
    prisma.bugReport.findUnique.mockResolvedValue({
      id: 1,
      gameId: 2,
      authorId: user.id,
      status: BugReportStatus.PENDING_ADMIN,
      author: { id: user.id, role: UserRole.USER, email: null, steamId: 'steam' },
      comments: [],
      statusLog: [],
    });

    await expect(service.getBugReport(1, user)).resolves.toMatchObject({ id: 1 });
    expect(authorization.ensureCanAccessGame).toHaveBeenCalledWith(user, 2);
  });

  it('hides non-public reports from other users', async () => {
    prisma.bugReport.findUnique.mockResolvedValue({
      id: 1,
      gameId: 2,
      authorId: 99,
      status: BugReportStatus.PENDING_ADMIN,
      author: { id: 99, role: UserRole.USER, email: null, steamId: 'steam' },
      comments: [],
      statusLog: [],
    });

    await expect(service.getBugReport(1, user)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('hides admin-only statuses from developers', async () => {
    prisma.bugReport.findUnique.mockResolvedValue({
      id: 1,
      gameId: 2,
      authorId: 99,
      status: BugReportStatus.REJECTED_BY_ADMIN,
      author: { id: 99, role: UserRole.USER, email: null, steamId: 'steam' },
      comments: [],
      statusLog: [],
    });

    await expect(service.getBugReport(1, developer)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws when report missing', async () => {
    prisma.bugReport.findUnique.mockResolvedValue(null);
    await expect(service.getBugReport(123, admin)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists pending reports for admin', async () => {
    prisma.bugReport.findMany.mockResolvedValue([{ id: 2 }]);
    await expect(service.listPendingForAdmin()).resolves.toEqual([{ id: 2 }]);
    expect(prisma.bugReport.findMany).toHaveBeenCalled();
  });

  it('handles admin review approval and comment', async () => {
    prisma.bugReport.findUnique.mockResolvedValue({
      id: 1,
      status: BugReportStatus.PENDING_ADMIN,
      gameId: 1,
      authorId: user.id,
    });
    prisma.bugReport.update.mockResolvedValue({ id: 1, status: BugReportStatus.VISIBLE_TO_DEV });

    const result = await service.adminReview(1, admin, { action: AdminBugReportAction.APPROVE, comment: 'ok' });
    expect(result.status).toBe(BugReportStatus.VISIBLE_TO_DEV);
    expect(prisma.bugReportStatusChange.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ newStatus: BugReportStatus.VISIBLE_TO_DEV }) }),
    );
    expect(prisma.bugReportComment.create).toHaveBeenCalled();
  });

  it('handles admin rejection without comment', async () => {
    prisma.bugReport.findUnique.mockResolvedValue({
      id: 2,
      status: BugReportStatus.PENDING_ADMIN,
      gameId: 1,
      authorId: user.id,
    });
    prisma.bugReport.update.mockResolvedValue({ id: 2, status: BugReportStatus.REJECTED_BY_ADMIN });
    prisma.bugReportStatusChange.create.mockResolvedValue({} as any);
    prisma.bugReportComment.create.mockResolvedValue({} as any);

    const result = await service.adminReview(2, admin, { action: AdminBugReportAction.REJECT });
    expect(result.status).toBe(BugReportStatus.REJECTED_BY_ADMIN);
    expect(prisma.bugReportComment.create).not.toHaveBeenCalled();
  });

  it('prevents review when not pending', async () => {
    prisma.bugReport.findUnique.mockResolvedValue({ id: 1, status: BugReportStatus.CLOSED, gameId: 1, authorId: 1 });
    await expect(
      service.adminReview(1, admin, { action: AdminBugReportAction.REJECT }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('blocks developer updates on hidden reports', async () => {
    prisma.bugReport.findUnique.mockResolvedValue({
      id: 1,
      status: BugReportStatus.PENDING_ADMIN,
      gameId: 1,
      authorId: 1,
    });

    await expect(
      service.developerUpdateStatus(1, developer, { status: BugReportStatus.CLOSED }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('blocks invalid status transitions', async () => {
    prisma.bugReport.findUnique.mockResolvedValue({
      id: 1,
      status: BugReportStatus.VISIBLE_TO_DEV,
      gameId: 1,
      authorId: 1,
    });
    authorization.ensureDeveloperAssignedToGame.mockResolvedValue(undefined);

    await expect(
      service.developerUpdateStatus(1, developer, { status: BugReportStatus.PENDING_ADMIN }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws not found during admin review when report missing', async () => {
    prisma.bugReport.findUnique.mockResolvedValue(null);
    await expect(service.adminReview(999, admin, { action: AdminBugReportAction.APPROVE })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('allows developer status updates following workflow', async () => {
    prisma.bugReport.findUnique.mockResolvedValue({
      id: 1,
      status: BugReportStatus.VISIBLE_TO_DEV,
      gameId: 1,
      authorId: 1,
    });
    prisma.bugReport.update.mockResolvedValue({ id: 1, status: BugReportStatus.IN_PROGRESS });
    authorization.ensureDeveloperAssignedToGame.mockResolvedValue(undefined);

    const result = await service.developerUpdateStatus(1, developer, { status: BugReportStatus.IN_PROGRESS });
    expect(result.status).toBe(BugReportStatus.IN_PROGRESS);
    expect(prisma.bugReportStatusChange.create).toHaveBeenCalled();
  });

  it('returns report to admin regardless of status', async () => {
    prisma.bugReport.findUnique.mockResolvedValue({
      id: 15,
      gameId: 5,
      authorId: user.id,
      status: BugReportStatus.REJECTED_BY_ADMIN,
      author: { id: user.id, role: UserRole.USER, email: null, steamId: 'steam' },
      comments: [],
      statusLog: [],
    });

    await expect(service.getBugReport(15, admin)).resolves.toMatchObject({ id: 15 });
  });

  it('allows developers to view visible reports', async () => {
    prisma.bugReport.findUnique.mockResolvedValue({
      id: 16,
      gameId: 5,
      authorId: user.id,
      status: BugReportStatus.VISIBLE_TO_DEV,
      author: { id: user.id, role: UserRole.USER, email: null, steamId: 'steam' },
      comments: [],
      statusLog: [],
    });
    await expect(service.getBugReport(16, developer)).resolves.toMatchObject({ id: 16 });
  });
});
