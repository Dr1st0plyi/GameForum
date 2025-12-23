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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreadsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const authorization_service_1 = require("../../common/services/authorization.service");
const create_thread_dto_1 = require("./dto/create-thread.dto");
const set_lock_status_dto_1 = require("./dto/set-lock-status.dto");
const update_thread_dto_1 = require("./dto/update-thread.dto");
const threads_service_1 = require("./threads.service");
let ThreadsController = class ThreadsController {
    threadsService;
    authorization;
    constructor(threadsService, authorization) {
        this.threadsService = threadsService;
        this.authorization = authorization;
    }
    async listThreads(gameId, user) {
        await this.authorization.ensureCanAccessGame(user, gameId);
        return this.threadsService.listGameThreads(gameId);
    }
    async createThread(gameId, dto, user) {
        return this.threadsService.createThread(gameId, user, dto);
    }
    async getThread(id, user) {
        const thread = await this.threadsService.getThread(id);
        await this.authorization.ensureCanAccessGame(user, thread.gameId);
        return thread;
    }
    async updateThread(id, dto, user) {
        return this.threadsService.updateThread(id, user, dto);
    }
    async deleteThread(id) {
        return this.threadsService.deleteThread(id);
    }
    async lockThread(id, dto) {
        return this.threadsService.lockThread(id, dto.isLocked);
    }
};
exports.ThreadsController = ThreadsController;
__decorate([
    (0, common_1.Get)('games/:gameId/threads'),
    __param(0, (0, common_1.Param)('gameId', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ThreadsController.prototype, "listThreads", null);
__decorate([
    (0, common_1.Post)('games/:gameId/threads'),
    __param(0, (0, common_1.Param)('gameId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_thread_dto_1.CreateThreadDto, Object]),
    __metadata("design:returntype", Promise)
], ThreadsController.prototype, "createThread", null);
__decorate([
    (0, common_1.Get)('threads/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ThreadsController.prototype, "getThread", null);
__decorate([
    (0, common_1.Patch)('threads/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_thread_dto_1.UpdateThreadDto, Object]),
    __metadata("design:returntype", Promise)
], ThreadsController.prototype, "updateThread", null);
__decorate([
    (0, common_1.Delete)('threads/:id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ThreadsController.prototype, "deleteThread", null);
__decorate([
    (0, common_1.Patch)('threads/:id/lock'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, set_lock_status_dto_1.SetLockStatusDto]),
    __metadata("design:returntype", Promise)
], ThreadsController.prototype, "lockThread", null);
exports.ThreadsController = ThreadsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [threads_service_1.ThreadsService,
        authorization_service_1.AuthorizationService])
], ThreadsController);
//# sourceMappingURL=threads.controller.js.map