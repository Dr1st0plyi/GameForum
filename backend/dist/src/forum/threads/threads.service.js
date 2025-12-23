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
exports.ThreadsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const authorization_service_1 = require("../../common/services/authorization.service");
const prisma_service_1 = require("../../prisma/prisma.service");
let ThreadsService = class ThreadsService {
    prisma;
    authorization;
    constructor(prisma, authorization) {
        this.prisma = prisma;
        this.authorization = authorization;
    }
    async listGameThreads(gameId) {
        return this.prisma.thread.findMany({
            where: { gameId, isDeleted: false },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getThread(id) {
        const thread = await this.prisma.thread.findFirst({
            where: { id, isDeleted: false },
        });
        if (!thread) {
            throw new common_1.NotFoundException('Thread not found');
        }
        return thread;
    }
    async createThread(gameId, user, dto) {
        await this.authorization.ensureCanAccessGame(user, gameId);
        await this.authorization.ensureUserNotBanned(user.id);
        return this.prisma.thread.create({
            data: {
                gameId,
                authorId: user.id,
                title: dto.title,
                posts: {
                    create: {
                        authorId: user.id,
                        content: dto.content,
                    },
                },
            },
        });
    }
    async updateThread(id, user, data) {
        const thread = await this.getThread(id);
        this.authorization.ensureAuthorOrAdmin(user, thread.authorId);
        if (thread.isLocked && user.role !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Thread is locked');
        }
        return this.prisma.thread.update({ where: { id }, data });
    }
    async deleteThread(id) {
        await this.getThread(id);
        return this.prisma.thread.update({ where: { id }, data: { isDeleted: true } });
    }
    async lockThread(id, isLocked) {
        await this.getThread(id);
        return this.prisma.thread.update({ where: { id }, data: { isLocked } });
    }
};
exports.ThreadsService = ThreadsService;
exports.ThreadsService = ThreadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        authorization_service_1.AuthorizationService])
], ThreadsService);
//# sourceMappingURL=threads.service.js.map