"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const authorization_service_1 = require("../../common/services/authorization.service");
const prisma_service_1 = require("../../prisma/prisma.service");
let PostsService = class PostsService {
    prisma;
    authorization;
    constructor(prisma, authorization) {
        this.prisma = prisma;
        this.authorization = authorization;
    }
    async getThread(threadId) {
        const thread = await this.prisma.thread.findFirst({ where: { id: threadId, isDeleted: false } });
        if (!thread) {
            throw new common_1.NotFoundException('Thread not found');
        }
        return thread;
    }
    async getPost(id) {
        const post = await this.prisma.post.findFirst({ where: { id, isDeleted: false } });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        return post;
    }
    async listPosts(threadId, user) {
        const thread = await this.getThread(threadId);
        await this.authorization.ensureCanAccessGame(user, thread.gameId);
        return this.prisma.post.findMany({
            where: { threadId, isDeleted: false },
            orderBy: { createdAt: 'asc' },
        });
    }
    async createPost(threadId, user, dto) {
        const thread = await this.getThread(threadId);
        await this.authorization.ensureCanAccessGame(user, thread.gameId);
        await this.authorization.ensureUserNotBanned(user.id);
        if (thread.isLocked && user.role !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Thread is locked');
        }
        return this.prisma.post.create({
            data: {
                threadId,
                authorId: user.id,
                content: dto.content,
            },
        });
    }
    async updatePost(postId, user, dto) {
        const post = await this.getPost(postId);
        const thread = await this.getThread(post.threadId);
        await this.authorization.ensureCanAccessGame(user, thread.gameId);
        this.authorization.ensureAuthorOrAdmin(user, post.authorId);
        return this.prisma.post.update({ where: { id: postId }, data: dto });
    }
    async deletePost(postId) {
        await this.getPost(postId);
        return this.prisma.post.update({ where: { id: postId }, data: { isDeleted: true } });
    }
    async setSpoiler(postId, isSpoiler) {
        await this.getPost(postId);
        return this.prisma.post.update({ where: { id: postId }, data: { isSpoiler } });
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        authorization_service_1.AuthorizationService])
], PostsService);
//# sourceMappingURL=posts.service.js.map