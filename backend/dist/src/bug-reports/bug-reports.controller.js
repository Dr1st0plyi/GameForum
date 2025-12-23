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
exports.BugReportsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const bug_reports_service_1 = require("./bug-reports.service");
const admin_review_bug_report_dto_1 = require("./dto/admin-review-bug-report.dto");
const create_bug_report_dto_1 = require("./dto/create-bug-report.dto");
const developer_update_status_dto_1 = require("./dto/developer-update-status.dto");
const filter_bug_reports_dto_1 = require("./dto/filter-bug-reports.dto");
let BugReportsController = class BugReportsController {
    bugReportsService;
    constructor(bugReportsService) {
        this.bugReportsService = bugReportsService;
    }
    async createBugReport(gameId, dto, user) {
        return this.bugReportsService.createBugReport(gameId, user, dto);
    }
    async listBugReports(gameId, filter, user) {
        return this.bugReportsService.listBugReports(gameId, user, filter);
    }
    async getBugReport(id, user) {
        return this.bugReportsService.getBugReport(id, user);
    }
    async adminReview(id, dto, user) {
        return this.bugReportsService.adminReview(id, user, dto);
    }
    async developerUpdateStatus(id, dto, user) {
        return this.bugReportsService.developerUpdateStatus(id, user, dto);
    }
};
exports.BugReportsController = BugReportsController;
__decorate([
    (0, common_1.Post)('games/:gameId/bug-reports'),
    __param(0, (0, common_1.Param)('gameId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_bug_report_dto_1.CreateBugReportDto, Object]),
    __metadata("design:returntype", Promise)
], BugReportsController.prototype, "createBugReport", null);
__decorate([
    (0, common_1.Get)('games/:gameId/bug-reports'),
    __param(0, (0, common_1.Param)('gameId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, filter_bug_reports_dto_1.FilterBugReportsDto, Object]),
    __metadata("design:returntype", Promise)
], BugReportsController.prototype, "listBugReports", null);
__decorate([
    (0, common_1.Get)('bug-reports/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], BugReportsController.prototype, "getBugReport", null);
__decorate([
    (0, common_1.Patch)('bug-reports/:id/admin-review'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, admin_review_bug_report_dto_1.AdminReviewBugReportDto, Object]),
    __metadata("design:returntype", Promise)
], BugReportsController.prototype, "adminReview", null);
__decorate([
    (0, common_1.Patch)('bug-reports/:id/status'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.DEVELOPER),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, developer_update_status_dto_1.DeveloperUpdateStatusDto, Object]),
    __metadata("design:returntype", Promise)
], BugReportsController.prototype, "developerUpdateStatus", null);
exports.BugReportsController = BugReportsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [bug_reports_service_1.BugReportsService])
], BugReportsController);
//# sourceMappingURL=bug-reports.controller.js.map