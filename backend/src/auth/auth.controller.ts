import { BadRequestException, Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('steam')
  @UseGuards(AuthGuard('steam'))
  async steamLogin() {
    return;
  }

  @Get('steam/callback')
  async steamCallback(@Req() req: Request, @Res() res: Response) {
    const claimedIdParam = req.query['openid.claimed_id'] ?? req.query['openid.identity'];
    const claimedId = Array.isArray(claimedIdParam) ? claimedIdParam[0] : claimedIdParam;

    if (!claimedId || typeof claimedId !== 'string') {
      throw new BadRequestException('Invalid Steam callback: missing claimed_id');
    }

    const match = claimedId.match(/\/id\/(\d+)$/);
    if (!match) {
      throw new BadRequestException('Invalid Steam claimed_id format');
    }

    const steamId = match[1];
    const user = await this.authService.handleSteamLogin({ id: steamId, displayName: undefined });
    const loginResult = await this.authService.login(user);

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    const redirectUrl = new URL(frontendUrl);
    redirectUrl.pathname = '/steam-callback';
    redirectUrl.hash = `accessToken=${encodeURIComponent(
      loginResult.accessToken,
    )}&user=${encodeURIComponent(JSON.stringify(loginResult.user))}`;

    return res.redirect(redirectUrl.toString());
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Body() _dto: LoginDto, @Req() req: Request) {
    const user = req.user as any;
    return this.authService.login(user);
  }

  @Post('logout')
  async logout() {
    return { success: true };
  }
}
