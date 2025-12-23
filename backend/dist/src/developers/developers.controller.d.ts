import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { BugReportsService } from '../bug-reports/bug-reports.service';
import { FilterBugReportsDto } from '../bug-reports/dto/filter-bug-reports.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class DevelopersController {
    private readonly prisma;
    private readonly bugReportsService;
    constructor(prisma: PrismaService, bugReportsService: BugReportsService);
    listAssignedGames(user: AuthenticatedUser): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        steamAppId: number;
        title: string;
        description: string | null;
    }[]>;
    listBugReportsForGame(gameId: number, filter: FilterBugReportsDto, user: AuthenticatedUser): Promise<({
        author: {
            id: number;
            email: string | null;
            steamId: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        gameId: number;
        authorId: number;
        status: import("@prisma/client").$Enums.BugReportStatus;
    })[]>;
}
