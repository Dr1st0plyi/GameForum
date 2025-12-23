import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UsersService } from '../users/users.service';
import { UpdateBanStatusDto } from './dto/update-ban-status.dto';
import { BugReportsService } from '../bug-reports/bug-reports.service';
export declare class AdminController {
    private readonly usersService;
    private readonly bugReportsService;
    constructor(usersService: UsersService, bugReportsService: BugReportsService);
    listUsers(query: PaginationQueryDto): Promise<{
        items: {
            id: number;
            email: string | null;
            steamId: string | null;
            passwordHash: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            isBanned: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
    }>;
    updateBanStatus(id: number, dto: UpdateBanStatusDto): Promise<{
        id: number;
        email: string | null;
        steamId: string | null;
        passwordHash: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isBanned: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    pendingBugReports(): Promise<({
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
}
