import { BadRequestException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  const authService = {
    handleSteamLogin: jest.fn(),
    login: jest.fn(),
  };

  const controller = new AuthController(authService as unknown as AuthService);

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.FRONTEND_URL;
  });

  it('handles steam callback and redirects', async () => {
    authService.handleSteamLogin.mockResolvedValue({ id: 1, role: UserRole.USER });
    authService.login.mockResolvedValue({ accessToken: 'token', user: { id: 1, role: UserRole.USER } });

    const redirect = jest.fn();
    const req = { query: { 'openid.claimed_id': 'https://steamcommunity.com/openid/id/12345' } };

    await controller.steamCallback(req as any, { redirect } as any);
    expect(authService.handleSteamLogin).toHaveBeenCalledWith({ id: '12345', displayName: undefined });
    expect(redirect).toHaveBeenCalled();
  });

  it('handles alternate claimed_id sources and custom frontend url', async () => {
    process.env.FRONTEND_URL = 'http://example.com';
    authService.handleSteamLogin.mockResolvedValue({ id: 2, role: UserRole.USER });
    authService.login.mockResolvedValue({ accessToken: 'token2', user: { id: 2, role: UserRole.USER } });

    const redirect = jest.fn();
    const req = { query: { 'openid.identity': ['https://steamcommunity.com/openid/id/555'] } };

    await controller.steamCallback(req as any, { redirect } as any);
    expect(redirect).toHaveBeenCalledWith(expect.stringContaining('example.com/steam-callback'));
    delete process.env.FRONTEND_URL;
  });

  it('throws when steam callback is invalid', async () => {
    await expect(controller.steamCallback({ query: {} } as any, {} as any)).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      controller.steamCallback({ query: { 'openid.claimed_id': 'bad-claimed-id' } } as any, {} as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('logs in via local strategy result', async () => {
    authService.login.mockResolvedValue({ accessToken: 'jwt', user: { id: 1 } });
    const req = { user: { id: 1, role: UserRole.ADMIN } };
    await expect(controller.login({ email: 'a', password: 'b' } as any, req as any)).resolves.toEqual({
      accessToken: 'jwt',
      user: { id: 1 },
    });
    expect(authService.login).toHaveBeenCalledWith(req.user);
  });

  it('supports steam login endpoint', async () => {
    await expect(controller.steamLogin()).resolves.toBeUndefined();
  });

  it('logs out successfully', async () => {
    await expect(controller.logout()).resolves.toEqual({ success: true });
  });
});
