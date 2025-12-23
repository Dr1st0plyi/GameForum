import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { SteamService } from '../steam/steam.service';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { SteamProfile } from './interfaces/steam-profile.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly steamService: SteamService,
  ) {}

  async validateLocalUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role === UserRole.USER) {
      throw new UnauthorizedException('Please login with Steam');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async handleSteamLogin(profile: SteamProfile) {
    if (!profile.id) {
      throw new UnauthorizedException('Invalid Steam profile');
    }

    let user = await this.usersService.findBySteamId(profile.id);
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          steamId: profile.id,
          role: UserRole.USER,
        },
      });
    }

    await this.steamService.syncUserLibrary(user.id, profile.id);
    return user;
  }

  buildAuthenticatedUser(user: User): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      steamId: user.steamId,
      role: user.role,
    };
  }

  async login(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      email: user.email,
      steamId: user.steamId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: this.buildAuthenticatedUser(user),
    };
  }
}
