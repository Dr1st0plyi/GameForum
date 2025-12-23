import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { BugReportsService } from './bug-reports.service';
import { AdminReviewBugReportDto } from './dto/admin-review-bug-report.dto';
import { CreateBugReportDto } from './dto/create-bug-report.dto';
import { DeveloperUpdateStatusDto } from './dto/developer-update-status.dto';
import { FilterBugReportsDto } from './dto/filter-bug-reports.dto';
export declare class BugReportsController {
    private readonly bugReportsService;
    constructor(bugReportsService: BugReportsService);
    createBugReport(gameId: number, dto: CreateBugReportDto, user: AuthenticatedUser): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        gameId: number;
        authorId: number;
        status: import("@prisma/client").$Enums.BugReportStatus;
    }>;
    listBugReports(gameId: number, filter: FilterBugReportsDto, user: AuthenticatedUser): Promise<({
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
    adminReview(id: number, dto: AdminReviewBugReportDto, user: AuthenticatedUser): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        gameId: number;
        authorId: number;
        status: import("@prisma/client").$Enums.BugReportStatus;
    }>;
    developerUpdateStatus(id: number, dto: DeveloperUpdateStatusDto, user: AuthenticatedUser): Promise<{
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
