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
exports.GamesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GamesService = class GamesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listGames(currentUserId) {
        const games = await this.prisma.game.findMany({
            orderBy: { title: 'asc' },
        });
        if (!currentUserId) {
            return games.map((game) => ({ ...game, hasInLibrary: false }));
        }
        const ownedGames = await this.prisma.userGame.findMany({
            where: { userId: currentUserId },
            select: { gameId: true },
        });
        const ownedMap = new Set(ownedGames.map((item) => item.gameId));
        return games.map((game) => ({
            ...game,
            hasInLibrary: ownedMap.has(game.id),
        }));
    }
    async createGame(data) {
        return this.prisma.game.create({ data });
    }
    async updateGame(id, data) {
        const exists = await this.prisma.game.findUnique({ where: { id } });
        if (!exists) {
            throw new common_1.NotFoundException('Game not found');
        }
        return this.prisma.game.update({ where: { id }, data });
    }
    async removeGame(id) {
        const exists = await this.prisma.game.findUnique({ where: { id } });
        if (!exists) {
            throw new common_1.NotFoundException('Game not found');
        }
        return this.prisma.game.delete({ where: { id } });
    }
};
exports.GamesService = GamesService;
exports.GamesService = GamesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GamesService);
//# sourceMappingURL=games.service.js.map