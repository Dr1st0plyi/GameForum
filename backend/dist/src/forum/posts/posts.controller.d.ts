import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { CreatePostDto } from './dto/create-post.dto';
import { SetSpoilerDto } from './dto/set-spoiler.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
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
    createPost(threadId: number, dto: CreatePostDto, user: AuthenticatedUser): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        authorId: number;
        isDeleted: boolean;
        threadId: number;
        content: string;
        isSpoiler: boolean;
    }>;
    updatePost(id: number, dto: UpdatePostDto, user: AuthenticatedUser): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        authorId: number;
        isDeleted: boolean;
        threadId: number;
        content: string;
        isSpoiler: boolean;
    }>;
    deletePost(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        authorId: number;
        isDeleted: boolean;
        threadId: number;
        content: string;
        isSpoiler: boolean;
    }>;
    setSpoiler(id: number, dto: SetSpoilerDto): Promise<{
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
