import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { SteamStrategy } from './steam.strategy';

describe('Auth strategies', () => {
  it('delegates local validation', async () => {
    const authService = { validateLocalUser: jest.fn().mockResolvedValue({ id: 1 }) };
    const strategy = new LocalStrategy(authService as any);
    const result = await strategy.validate('mail@example.com', 'pass');
    expect(result).toEqual({ id: 1 });
    expect(authService.validateLocalUser).toHaveBeenCalledWith('mail@example.com', 'pass');
  });

  it('builds user payload in jwt strategy', async () => {
    const config = { getOrThrow: jest.fn().mockReturnValue('secret') } as unknown as ConfigService;
    const strategy = new JwtStrategy(config);
    const validated = await strategy.validate({
      sub: 10,
      role: UserRole.ADMIN,
      email: 'a@test',
      steamId: 'steam',
    });
    expect(validated).toEqual({ id: 10, role: UserRole.ADMIN, email: 'a@test', steamId: 'steam' });
  });

  it('validates steam profile through auth service', async () => {
    const config = {
      getOrThrow: jest.fn().mockImplementation((key: string) => {
        if (key === 'STEAM_OPENID_RETURN_URL') {
          return 'http://localhost/auth/steam/callback';
        }
        if (key === 'STEAM_API_KEY') {
          return 'key';
        }
        return '';
      }),
    } as unknown as ConfigService;

    const authService = { handleSteamLogin: jest.fn().mockResolvedValue({ id: 1 }) };
    const strategy = new SteamStrategy(config, authService as any);

    const result = await strategy.validate('identifier', { id: '123', displayName: 'SteamUser' } as any);
    expect(result).toEqual({ id: 1 });
    expect(authService.handleSteamLogin).toHaveBeenCalledWith({ id: '123', displayName: 'SteamUser' });
  });
});
