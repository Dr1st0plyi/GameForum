import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { SteamService } from '../steam/steam.service';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { SteamProfile } from './interfaces/steam-profile.interface';
export declare class AuthService {
    private readonly usersService;
    private readonly prisma;
    private readonly jwtService;
    private readonly steamService;
    constructor(usersService: UsersService, prisma: PrismaService, jwtService: JwtService, steamService: SteamService);
    validateLocalUser(email: string, password: string): Promise<{
        id: number;
        email: string | null;
        steamId: string | null;
        passwordHash: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isBanned: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    handleSteamLogin(profile: SteamProfile): Promise<{
        id: number;
        email: string | null;
        steamId: string | null;
        passwordHash: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isBanned: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    buildAuthenticatedUser(user: User): AuthenticatedUser;
    login(user: User): Promise<{
        accessToken: string;
        user: AuthenticatedUser;
    }>;
}
