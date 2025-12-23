import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class GamesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listGames(currentUserId?: number): Promise<{
        hasInLibrary: boolean;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        steamAppId: number;
        title: string;
        description: string | null;
    }[]>;
    createGame(data: Prisma.GameCreateInput): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        steamAppId: number;
        title: string;
        description: string | null;
    }>;
    updateGame(id: number, data: Prisma.GameUpdateInput): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        steamAppId: number;
        title: string;
        description: string | null;
    }>;
    removeGame(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        steamAppId: number;
        title: string;
        description: string | null;
    }>;
}
