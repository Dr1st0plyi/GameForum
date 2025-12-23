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
exports.AuthorizationService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuthorizationService = class AuthorizationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ensureUserExists(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async ensureUserNotBanned(userId) {
        const user = await this.ensureUserExists(userId);
        if (user.isBanned) {
            throw new common_1.ForbiddenException('User is banned');
        }
        return user;
    }
    async ensureUserHasGameAccess(userId, gameId) {
        await this.ensureUserNotBanned(userId);
        const relation = await this.prisma.userGame.findUnique({
            where: { userId_gameId: { userId, gameId } },
        });
        if (!relation) {
            throw new common_1.ForbiddenException('Game is not available in user library');
        }
    }
    async ensureDeveloperAssignedToGame(developerId, gameId) {
        const developer = await this.ensureUserExists(developerId);
        if (developer.role !== client_1.UserRole.DEVELOPER && developer.role !== client_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only developers or admins can perform this action');
        }
        if (developer.role === client_1.UserRole.ADMIN) {
            return;
        }
        const assignment = await this.prisma.developerGame.findUnique({
            where: {
                developerId_gameId: {
                    developerId,
                    gameId,
                },
            },
        });
        if (!assignment) {
            throw new common_1.ForbiddenException('Developer is not assigned to this game');
        }
    }
    async ensureCanAccessGame(user, gameId) {
        if (!user) {
            throw new common_1.ForbiddenException('Authentication required');
        }
        if (user.role === client_1.UserRole.ADMIN) {
            return;
        }
        if (user.role === client_1.UserRole.USER) {
            await this.ensureUserHasGameAccess(user.id, gameId);
            return;
        }
        if (user.role === client_1.UserRole.DEVELOPER) {
            await this.ensureDeveloperAssignedToGame(user.id, gameId);
            return;
        }
        throw new common_1.ForbiddenException('Forbidden');
    }
    ensureAuthorOrAdmin(user, authorId) {
        if (user.role === client_1.UserRole.ADMIN || user.id === authorId) {
            return;
        }
        throw new common_1.ForbiddenException('Operation not allowed');
    }
};
exports.AuthorizationService = AuthorizationService;
exports.AuthorizationService = AuthorizationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthorizationService);
//# sourceMappingURL=authorization.service.js.map