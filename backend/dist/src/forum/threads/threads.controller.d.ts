import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { AuthorizationService } from '../../common/services/authorization.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { SetLockStatusDto } from './dto/set-lock-status.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { ThreadsService } from './threads.service';
export declare class ThreadsController {
    private readonly threadsService;
    private readonly authorization;
    constructor(threadsService: ThreadsService, authorization: AuthorizationService);
    listThreads(gameId: number, user: AuthenticatedUser): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        gameId: number;
        authorId: number;
        isDeleted: boolean;
        isLocked: boolean;
    }[]>;
    createThread(gameId: number, dto: CreateThreadDto, user: AuthenticatedUser): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        gameId: number;
        authorId: number;
        isDeleted: boolean;
        isLocked: boolean;
    }>;
    getThread(id: number, user: AuthenticatedUser): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        gameId: number;
        authorId: number;
        isDeleted: boolean;
        isLocked: boolean;
    }>;
    updateThread(id: number, dto: UpdateThreadDto, user: AuthenticatedUser): Promise<{
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
    lockThread(id: number, dto: SetLockStatusDto): Promise<{
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
