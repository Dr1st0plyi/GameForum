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
exports.BugReportsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const authorization_service_1 = require("../common/services/authorization.service");
const prisma_service_1 = require("../prisma/prisma.service");
const admin_review_bug_report_dto_1 = require("./dto/admin-review-bug-report.dto");
const PUBLIC_STATUSES = [
    client_1.BugReportStatus.VISIBLE_TO_DEV,
    client_1.BugReportStatus.IN_PROGRESS,
    client_1.BugReportStatus.FIXED,
    client_1.BugReportStatus.CLOSED,
];
const ADMIN_ONLY_STATUSES = [client_1.BugReportStatus.PENDING_ADMIN, client_1.BugReportStatus.REJECTED_BY_ADMIN];
let BugReportsService = class BugReportsService {
    prisma;
    authorization;
    constructor(prisma, authorization) {
        this.prisma = prisma;
        this.authorization = authorization;
    }
    async getBugReportOrThrow(id) {
        const report = await this.prisma.bugReport.findUnique({ where: { id } });
        if (!report) {
            throw new common_1.NotFoundException('Bug report not found');
        }
        return report;
    }
    async createBugReport(gameId, user, dto) {
        await this.authorization.ensureCanAccessGame(user, gameId);
        await this.authorization.ensureUserNotBanned(user.id);
        return this.prisma.bugReport.create({
            data: {
                gameId,
                authorId: user.id,
                title: dto.title,
                description: dto.description,
                status: client_1.BugReportStatus.PENDING_ADMIN,
            },
        });
    }
    async listBugReports(gameId, user, filter) {
        await this.authorization.ensureCanAccessGame(user, gameId);
        const where = { gameId };
        if (user.role === client_1.UserRole.USER) {
            where['OR'] = [
                { authorId: user.id },
                { status: { in: PUBLIC_STATUSES } },
            ];
        }
        if (filter.status) {
            if (user.role === client_1.UserRole.DEVELOPER && ADMIN_ONLY_STATUSES.includes(filter.status)) {
                throw new common_1.ForbiddenException('Status not visible to developers');
            }
            where['status'] = filter.status;
        }
        else if (user.role === client_1.UserRole.DEVELOPER) {
            where['status'] = { notIn: ADMIN_ONLY_STATUSES };
        }
        return this.prisma.bugReport.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { id: true, email: true, steamId: true, role: true },
                },
            },
        });
    }
    async getBugReport(id, user) {
        const report = await this.prisma.bugReport.findUnique({
            where: { id },
            include: {
                author: { select: { id: true, email: true, steamId: true, role: true } },
                comments: {
                    orderBy: { createdAt: 'asc' },
                },
                statusLog: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!report) {
            throw new common_1.NotFoundException('Bug report not found');
        }
        await this.ensureVisibility(report, user);
        return report;
    }
    listPendingForAdmin() {
        return this.prisma.bugReport.findMany({
            where: { status: client_1.BugReportStatus.PENDING_ADMIN },
            orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { id: true, email: true, steamId: true, role: true } },
                game: { select: { id: true, title: true } },
            },
        });
    }
    async ensureVisibility(report, user) {
        await this.authorization.ensureCanAccessGame(user, report.gameId);
        if (user.role === client_1.UserRole.ADMIN) {
            return;
        }
        if (user.role === client_1.UserRole.DEVELOPER) {
            if (ADMIN_ONLY_STATUSES.includes(report.status)) {
                throw new common_1.ForbiddenException('Bug report hidden from developer');
            }
            return;
        }
        if (user.role === client_1.UserRole.USER && report.authorId !== user.id && !PUBLIC_STATUSES.includes(report.status)) {
            throw new common_1.ForbiddenException('Bug report hidden');
        }
    }
    async adminReview(id, admin, dto) {
        const report = await this.getBugReportOrThrow(id);
        if (report.status !== client_1.BugReportStatus.PENDING_ADMIN) {
            throw new common_1.ForbiddenException('Bug report already reviewed');
        }
        const newStatus = dto.action === admin_review_bug_report_dto_1.AdminBugReportAction.APPROVE
            ? client_1.BugReportStatus.VISIBLE_TO_DEV
            : client_1.BugReportStatus.REJECTED_BY_ADMIN;
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.bugReport.update({
                where: { id },
                data: { status: newStatus },
            });
            await tx.bugReportStatusChange.create({
                data: {
                    bugReportId: id,
                    changedById: admin.id,
                    oldStatus: report.status,
                    newStatus,
                },
            });
            if (dto.comment) {
                await tx.bugReportComment.create({
                    data: {
                        bugReportId: id,
                        authorId: admin.id,
                        content: dto.comment,
                    },
                });
            }
            return updated;
        });
    }
    async developerUpdateStatus(id, user, dto) {
        const report = await this.getBugReportOrThrow(id);
        await this.authorization.ensureDeveloperAssignedToGame(user.id, report.gameId);
        if (report.status === client_1.BugReportStatus.PENDING_ADMIN || report.status === client_1.BugReportStatus.REJECTED_BY_ADMIN) {
            throw new common_1.ForbiddenException('Bug report not visible to developer');
        }
        const allowedTransitions = {
            [client_1.BugReportStatus.VISIBLE_TO_DEV]: [client_1.BugReportStatus.IN_PROGRESS, client_1.BugReportStatus.FIXED, client_1.BugReportStatus.CLOSED],
            [client_1.BugReportStatus.IN_PROGRESS]: [client_1.BugReportStatus.FIXED, client_1.BugReportStatus.CLOSED],
            [client_1.BugReportStatus.FIXED]: [],
            [client_1.BugReportStatus.CLOSED]: [],
            [client_1.BugReportStatus.PENDING_ADMIN]: [],
            [client_1.BugReportStatus.REJECTED_BY_ADMIN]: [],
        };
        const canTransition = allowedTransitions[report.status].includes(dto.status);
        if (!canTransition) {
            throw new common_1.ForbiddenException('Invalid status transition');
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.bugReport.update({ where: { id }, data: { status: dto.status } });
            await tx.bugReportStatusChange.create({
                data: {
                    bugReportId: id,
                    changedById: user.id,
                    oldStatus: report.status,
                    newStatus: dto.status,
                },
            });
            return updated;
        });
    }
};
exports.BugReportsService = BugReportsService;
exports.BugReportsService = BugReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        authorization_service_1.AuthorizationService])
], BugReportsService);
//# sourceMappingURL=bug-reports.service.js.map