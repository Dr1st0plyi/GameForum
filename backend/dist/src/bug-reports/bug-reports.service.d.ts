import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { AuthorizationService } from '../common/services/authorization.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminReviewBugReportDto } from './dto/admin-review-bug-report.dto';
import { CreateBugReportDto } from './dto/create-bug-report.dto';
import { DeveloperUpdateStatusDto } from './dto/developer-update-status.dto';
import { FilterBugReportsDto } from './dto/filter-bug-reports.dto';
export declare class BugReportsService {
    private readonly prisma;
    private readonly authorization;
    constructor(prisma: PrismaService, authorization: AuthorizationService);
    private getBugReportOrThrow;
    createBugReport(gameId: number, user: AuthenticatedUser, dto: CreateBugReportDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        gameId: number;
        authorId: number;
        status: import("@prisma/client").$Enums.BugReportStatus;
    }>;
    listBugReports(gameId: number, user: AuthenticatedUser, filter: FilterBugReportsDto): Promise<({
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
    getBugReport(id: number, user: AuthenticatedUser): Promise<{
        author: {
            id: number;
            email: string | null;
            steamId: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
        comments: {
            id: number;
            createdAt: Date;
            authorId: number;
            bugReportId: number;
            content: string;
        }[];
        statusLog: {
            id: number;
            createdAt: Date;
            bugReportId: number;
            changedById: number;
            oldStatus: import("@prisma/client").$Enums.BugReportStatus;
            newStatus: import("@prisma/client").$Enums.BugReportStatus;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        gameId: number;
        authorId: number;
        status: import("@prisma/client").$Enums.BugReportStatus;
    }>;
    listPendingForAdmin(): import("@prisma/client").Prisma.PrismaPromise<({
        game: {
            id: number;
            title: string;
        };
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
    private ensureVisibility;
    adminReview(id: number, admin: AuthenticatedUser, dto: AdminReviewBugReportDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        gameId: number;
        authorId: number;
        status: import("@prisma/client").$Enums.BugReportStatus;
    }>;
    developerUpdateStatus(id: number, user: AuthenticatedUser, dto: DeveloperUpdateStatusDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        gameId: number;
        authorId: number;
        status: import("@prisma/client").$Enums.BugReportStatus;
    }>;
}
