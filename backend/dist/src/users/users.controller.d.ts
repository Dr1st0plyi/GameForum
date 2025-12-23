import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
export declare class UsersController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(user: AuthenticatedUser): import("@prisma/client").Prisma.Prisma__UserClient<{
        id: number;
        email: string | null;
        steamId: string | null;
        passwordHash: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isBanned: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import(".prisma/client/default/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
