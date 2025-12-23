import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { BugReportsService } from '../bug-reports/bug-reports.service';
import { DevelopersController } from './developers.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('DevelopersController', () => {
  const prisma = {
    game: { findMany: jest.fn() },
  } as unknown as PrismaService;
  const bugReportsService = {
    listBugReports: jest.fn(),
  } as unknown as BugReportsService;

  const controller = new DevelopersController(prisma, bugReportsService);
  const developer: AuthenticatedUser = { id: 2, role: UserRole.DEVELOPER, email: 'dev@test', steamId: null };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists assigned games for developer', async () => {
    (prisma.game.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);
    await expect(controller.listAssignedGames(developer)).resolves.toEqual([{ id: 1 }]);
    expect(prisma.game.findMany).toHaveBeenCalledWith({
      where: { developerGames: { some: { developerId: developer.id } } },
      orderBy: { title: 'asc' },
    });
  });

  it('lists bug reports for specific game', async () => {
    (bugReportsService.listBugReports as jest.Mock).mockResolvedValue([{ id: 5 }]);
    await expect(controller.listBugReportsForGame(3, {}, developer)).resolves.toEqual([{ id: 5 }]);
    expect(bugReportsService.listBugReports).toHaveBeenCalledWith(3, developer, {});
  });
});
