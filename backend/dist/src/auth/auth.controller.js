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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const login_dto_1 = require("./dto/login.dto");
const auth_service_1 = require("./auth.service");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async steamLogin() {
        return;
    }
    async steamCallback(req, res) {
        const claimedIdParam = req.query['openid.claimed_id'] ?? req.query['openid.identity'];
        const claimedId = Array.isArray(claimedIdParam) ? claimedIdParam[0] : claimedIdParam;
        if (!claimedId || typeof claimedId !== 'string') {
            throw new common_1.BadRequestException('Invalid Steam callback: missing claimed_id');
        }
        const match = claimedId.match(/\/id\/(\d+)$/);
        if (!match) {
            throw new common_1.BadRequestException('Invalid Steam claimed_id format');
        }
        const steamId = match[1];
        const user = await this.authService.handleSteamLogin({ id: steamId, displayName: undefined });
        const loginResult = await this.authService.login(user);
        const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
        const redirectUrl = new URL(frontendUrl);
        redirectUrl.pathname = '/steam-callback';
        redirectUrl.hash = `accessToken=${encodeURIComponent(loginResult.accessToken)}&user=${encodeURIComponent(JSON.stringify(loginResult.user))}`;
        return res.redirect(redirectUrl.toString());
    }
    async login(_dto, req) {
        const user = req.user;
        return this.authService.login(user);
    }
    async logout() {
        return { success: true };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('steam'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('steam')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "steamLogin", null);
__decorate([
    (0, common_1.Get)('steam/callback'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "steamCallback", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('local')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('logout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map