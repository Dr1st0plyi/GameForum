import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Prisma.Prisma__UserClient<{
        id: number;
        email: string | null;
        steamId: string | null;
        passwordHash: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isBanned: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import(".prisma/client/default/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    findBySteamId(steamId: string): Prisma.Prisma__UserClient<{
        id: number;
        email: string | null;
        steamId: string | null;
        passwordHash: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isBanned: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import(".prisma/client/default/runtime/library").DefaultArgs, Prisma.PrismaClientOptions>;
    createSteamUser(data: {
        steamId: string;
        personaName?: string | null;
    }): Promise<{
        id: number;
        email: string | null;
        steamId: string | null;
        passwordHash: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isBanned: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateUser(userId: number, payload: Prisma.UserUpdateInput): Promise<{
        id: number;
        email: string | null;
        steamId: string | null;
        passwordHash: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isBanned: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listUsers(params: {
        skip?: number;
        take?: number;
    }): Promise<{
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
    banUser(userId: number): Promise<{
        id: number;
        email: string | null;
        steamId: string | null;
        passwordHash: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isBanned: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    unbanUser(userId: number): Promise<{
        id: number;
        email: string | null;
        steamId: string | null;
        passwordHash: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isBanned: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
