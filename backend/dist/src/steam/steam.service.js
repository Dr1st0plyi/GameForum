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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SteamService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SteamService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const prisma_service_1 = require("../prisma/prisma.service");
let SteamService = SteamService_1 = class SteamService {
    configService;
    prisma;
    logger = new common_1.Logger(SteamService_1.name);
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
    }
    async syncUserLibrary(userId, steamId) {
        const apiKey = this.configService.get('STEAM_API_KEY');
        if (!apiKey) {
            this.logger.warn('STEAM_API_KEY is not defined, skipping Steam sync');
            return [];
        }
        try {
            const { data } = await axios_1.default.get('https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/', {
                params: {
                    key: apiKey,
                    steamid: steamId,
                    include_appinfo: false,
                    format: 'json',
                },
            });
            const games = data.response?.games ?? [];
            const appIds = games.map((game) => game.appid);
            if (appIds.length === 0) {
                await this.prisma.userGame.deleteMany({ where: { userId } });
                return [];
            }
            const existingGames = await this.prisma.game.findMany({
                where: { steamAppId: { in: appIds } },
                select: { id: true },
            });
            const gameIds = existingGames.map((game) => game.id);
            await this.prisma.$transaction([
                this.prisma.userGame.deleteMany({
                    where: {
                        userId,
                        gameId: { notIn: gameIds },
                    },
                }),
                this.prisma.userGame.createMany({
                    data: gameIds.map((gameId) => ({ userId, gameId, lastSyncedAt: new Date() })),
                    skipDuplicates: true,
                }),
            ]);
            return gameIds;
        }
        catch (error) {
            this.logger.error('Failed to sync Steam library', error);
            return [];
        }
    }
};
exports.SteamService = SteamService;
exports.SteamService = SteamService = SteamService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, prisma_service_1.PrismaService])
], SteamService);
//# sourceMappingURL=steam.service.js.map