import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { BugReportsController } from './bug-reports.controller';
import { BugReportsService } from './bug-reports.service';

describe('BugReportsController', () => {
  const service = {
    createBugReport: jest.fn(),
    listBugReports: jest.fn(),
    getBugReport: jest.fn(),
    adminReview: jest.fn(),
    developerUpdateStatus: jest.fn(),
  };

  const controller = new BugReportsController(service as unknown as BugReportsService);
  const user: AuthenticatedUser = { id: 1, role: UserRole.USER, email: null, steamId: 'steam' };
  const admin: AuthenticatedUser = { id: 2, role: UserRole.ADMIN, email: 'a@test', steamId: null };
  const developer: AuthenticatedUser = { id: 3, role: UserRole.DEVELOPER, email: 'd@test', steamId: null };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates bug report', async () => {
    service.createBugReport.mockResolvedValue({ id: 1 });
    await expect(controller.createBugReport(2, { title: 'b', description: 'd' } as any, user)).resolves.toEqual({
      id: 1,
    });
  });

  it('lists bug reports', async () => {
    service.listBugReports.mockResolvedValue([{ id: 2 }]);
    await expect(controller.listBugReports(1, {}, user)).resolves.toEqual([{ id: 2 }]);
  });

  it('gets bug report', async () => {
    service.getBugReport.mockResolvedValue({ id: 3 });
    await expect(controller.getBugReport(3, user)).resolves.toEqual({ id: 3 });
  });

  it('handles admin review', async () => {
    service.adminReview.mockResolvedValue({ id: 4 });
    await expect(controller.adminReview(4, { action: 'APPROVE' } as any, admin)).resolves.toEqual({ id: 4 });
  });

  it('updates status by developer', async () => {
    service.developerUpdateStatus.mockResolvedValue({ id: 5 });
    await expect(controller.developerUpdateStatus(5, { status: 'IN_PROGRESS' } as any, developer)).resolves.toEqual({
      id: 5,
    });
  });
});
