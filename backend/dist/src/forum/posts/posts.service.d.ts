import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { AuthorizationService } from '../../common/services/authorization.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
export declare class PostsService {
    private readonly prisma;
    private readonly authorization;
    constructor(prisma: PrismaService, authorization: AuthorizationService);
    private getThread;
    private getPost;
    listPosts(threadId: number, user: AuthenticatedUser): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        authorId: number;
        isDeleted: boolean;
        threadId: number;
        content: string;
        isSpoiler: boolean;
    }[]>;
    createPost(threadId: number, user: AuthenticatedUser, dto: CreatePostDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        authorId: number;
        isDeleted: boolean;
        threadId: number;
        content: string;
        isSpoiler: boolean;
    }>;
    updatePost(postId: number, user: AuthenticatedUser, dto: UpdatePostDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        authorId: number;
        isDeleted: boolean;
        threadId: number;
        content: string;
        isSpoiler: boolean;
    }>;
    deletePost(postId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        authorId: number;
        isDeleted: boolean;
        threadId: number;
        content: string;
        isSpoiler: boolean;
    }>;
    setSpoiler(postId: number, isSpoiler: boolean): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        authorId: number;
        isDeleted: boolean;
        threadId: number;
        content: string;
        isSpoiler: boolean;
    }>;
}
