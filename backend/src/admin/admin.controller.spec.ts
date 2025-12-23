import { AdminController } from './admin.controller';
import { BugReportsService } from '../bug-reports/bug-reports.service';
import { UsersService } from '../users/users.service';

describe('AdminController', () => {
  const usersService = {
    listUsers: jest.fn(),
    banUser: jest.fn(),
    unbanUser: jest.fn(),
  };
  const bugReportsService = {
    listPendingForAdmin: jest.fn(),
  };

  const controller = new AdminController(usersService as unknown as UsersService, bugReportsService as unknown as BugReportsService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists users with pagination defaults', async () => {
    usersService.listUsers.mockResolvedValue({ items: [], total: 0 });
    await expect(controller.listUsers({ page: 2, pageSize: 5 } as any)).resolves.toEqual({ items: [], total: 0 });
    expect(usersService.listUsers).toHaveBeenCalledWith({ skip: 5, take: 5 });
  });

  it('lists users with fallback pagination values', async () => {
    usersService.listUsers.mockResolvedValue({ items: [], total: 0 });
    await controller.listUsers({} as any);
    expect(usersService.listUsers).toHaveBeenCalledWith({ skip: 0, take: 20 });
  });

  it('updates ban status', async () => {
    usersService.banUser.mockResolvedValue({ id: 1, isBanned: true });
    usersService.unbanUser.mockResolvedValue({ id: 1, isBanned: false });

    await expect(controller.updateBanStatus(1, { isBanned: true } as any)).resolves.toEqual({ id: 1, isBanned: true });
    await expect(controller.updateBanStatus(1, { isBanned: false } as any)).resolves.toEqual({ id: 1, isBanned: false });
  });

  it('returns pending bug reports for admin', async () => {
    bugReportsService.listPendingForAdmin.mockResolvedValue([{ id: 5 }]);
    await expect(controller.pendingBugReports()).resolves.toEqual([{ id: 5 }]);
  });
});
