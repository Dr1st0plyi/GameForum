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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const pagination_query_dto_1 = require("../common/dto/pagination-query.dto");
const users_service_1 = require("../users/users.service");
const update_ban_status_dto_1 = require("./dto/update-ban-status.dto");
const bug_reports_service_1 = require("../bug-reports/bug-reports.service");
let AdminController = class AdminController {
    usersService;
    bugReportsService;
    constructor(usersService, bugReportsService) {
        this.usersService = usersService;
        this.bugReportsService = bugReportsService;
    }
    async listUsers(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        return this.usersService.listUsers({ skip: (page - 1) * pageSize, take: pageSize });
    }
    async updateBanStatus(id, dto) {
        return dto.isBanned ? this.usersService.banUser(id) : this.usersService.unbanUser(id);
    }
    async pendingBugReports() {
        return this.bugReportsService.listPendingForAdmin();
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Patch)('users/:id/ban'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_ban_status_dto_1.UpdateBanStatusDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateBanStatus", null);
__decorate([
    (0, common_1.Get)('bug-reports/pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "pendingBugReports", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService, bug_reports_service_1.BugReportsService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map