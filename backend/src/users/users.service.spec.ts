import { UsersService } from './users.service';

describe('UsersService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  const service = new UsersService(prisma as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('finds by email and steam id', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1 });
    await expect(service.findByEmail('mail@test')).resolves.toEqual({ id: 1 });
    await expect(service.findBySteamId('steam')).resolves.toEqual({ id: 1 });
  });

  it('creates steam user', async () => {
    prisma.user.create.mockResolvedValue({ id: 2, steamId: 'steam' });
    await expect(service.createSteamUser({ steamId: 'steam' })).resolves.toEqual({ id: 2, steamId: 'steam' });
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('updates user', async () => {
    prisma.user.update.mockResolvedValue({ id: 3, email: 'new@test' });
    await expect(service.updateUser(3, { email: 'new@test' })).resolves.toEqual({ id: 3, email: 'new@test' });
  });

  it('lists users with total', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 1 }]);
    prisma.user.count.mockResolvedValue(1);
    const result = await service.listUsers({ skip: 0, take: 10 });
    expect(result).toEqual({ items: [{ id: 1 }], total: 1 });
  });

  it('bans and unbans users', async () => {
    prisma.user.update.mockResolvedValue({ id: 1, isBanned: true });
    await expect(service.banUser(1)).resolves.toEqual({ id: 1, isBanned: true });
    prisma.user.update.mockResolvedValue({ id: 1, isBanned: false });
    await expect(service.unbanUser(1)).resolves.toEqual({ id: 1, isBanned: false });
  });
});
