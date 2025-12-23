import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
export declare class AuthorizationService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    ensureUserExists(userId: number): Promise<{
        id: number;
        email: string | null;
        steamId: string | null;
        passwordHash: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isBanned: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    ensureUserNotBanned(userId: number): Promise<{
        id: number;
        email: string | null;
        steamId: string | null;
        passwordHash: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isBanned: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    ensureUserHasGameAccess(userId: number, gameId: number): Promise<void>;
    ensureDeveloperAssignedToGame(developerId: number, gameId: number): Promise<void>;
    ensureCanAccessGame(user: AuthenticatedUser | null, gameId: number): Promise<void>;
    ensureAuthorOrAdmin(user: AuthenticatedUser, authorId: number): void;
}
