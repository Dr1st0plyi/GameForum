import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import { AuthService } from '../auth.service';
import { SteamProfile } from '../interfaces/steam-profile.interface';

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor(configService: ConfigService, private readonly authService: AuthService) {
    const returnURL = configService.getOrThrow<string>('STEAM_OPENID_RETURN_URL');
    const realm = new URL(returnURL).origin;
    super({
      returnURL,
      realm,
      apiKey: configService.getOrThrow<string>('STEAM_API_KEY'),
    });
  }

  async validate(_identifier: string, profile: SteamProfile) {
    const steamProfile = {
      id: profile.id,
      displayName: profile.displayName,
    };
    return this.authService.handleSteamLogin(steamProfile);
  }
}
