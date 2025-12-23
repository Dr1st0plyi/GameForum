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
exports.DevelopersController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const bug_reports_service_1 = require("../bug-reports/bug-reports.service");
const filter_bug_reports_dto_1 = require("../bug-reports/dto/filter-bug-reports.dto");
const prisma_service_1 = require("../prisma/prisma.service");
let DevelopersController = class DevelopersController {
    prisma;
    bugReportsService;
    constructor(prisma, bugReportsService) {
        this.prisma = prisma;
        this.bugReportsService = bugReportsService;
    }
    async listAssignedGames(user) {
        return this.prisma.game.findMany({
            where: { developerGames: { some: { developerId: user.id } } },
            orderBy: { title: 'asc' },
        });
    }
    async listBugReportsForGame(gameId, filter, user) {
        return this.bugReportsService.listBugReports(gameId, user, filter);
    }
};
exports.DevelopersController = DevelopersController;
__decorate([
    (0, common_1.Get)('games'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevelopersController.prototype, "listAssignedGames", null);
__decorate([
    (0, common_1.Get)('games/:gameId/bug-reports'),
    __param(0, (0, common_1.Param)('gameId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, filter_bug_reports_dto_1.FilterBugReportsDto, Object]),
    __metadata("design:returntype", Promise)
], DevelopersController.prototype, "listBugReportsForGame", null);
exports.DevelopersController = DevelopersController = __decorate([
    (0, common_1.Controller)('developer'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.DEVELOPER),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, bug_reports_service_1.BugReportsService])
], DevelopersController);
//# sourceMappingURL=developers.controller.js.map