import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { CreateThreadDto } from './dto/create-thread.dto';
import { AuthorizationService } from '../../common/services/authorization.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateThreadDto } from './dto/update-thread.dto';
export declare class ThreadsService {
    private readonly prisma;
    private readonly authorization;
    constructor(prisma: PrismaService, authorization: AuthorizationService);
    listGameThreads(gameId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        gameId: number;
        authorId: number;
        isDeleted: boolean;
        isLocked: boolean;
    }[]>;
    getThread(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        gameId: number;
        authorId: number;
        isDeleted: boolean;
        isLocked: boolean;
    }>;
    createThread(gameId: number, user: AuthenticatedUser, dto: CreateThreadDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        gameId: number;
        authorId: number;
        isDeleted: boolean;
        isLocked: boolean;
    }>;
    updateThread(id: number, user: AuthenticatedUser, data: UpdateThreadDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        gameId: number;
        authorId: number;
        isDeleted: boolean;
        isLocked: boolean;
    }>;
    deleteThread(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        gameId: number;
        authorId: number;
        isDeleted: boolean;
        isLocked: boolean;
    }>;
    lockThread(id: number, isLocked: boolean): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        gameId: number;
        authorId: number;
        isDeleted: boolean;
        isLocked: boolean;
    }>;
}
