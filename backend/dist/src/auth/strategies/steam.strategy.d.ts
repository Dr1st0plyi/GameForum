import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { SteamProfile } from '../interfaces/steam-profile.interface';
declare const SteamStrategy_base: new (options: import("passport-steam").SteamStrategyOptions) => import("passport-steam")<import("passport-steam").SteamStrategyOptions> & {
    validate(...args: any[]): unknown;
};
export declare class SteamStrategy extends SteamStrategy_base {
    private readonly authService;
    constructor(configService: ConfigService, authService: AuthService);
    validate(_identifier: string, profile: SteamProfile): Promise<{
        id: number;
        email: string | null;
        steamId: string | null;
        passwordHash: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isBanned: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
