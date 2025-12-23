import { UsersController } from './users.controller';

describe('UsersController', () => {
  const prisma = {
    user: { findUnique: jest.fn() },
  } as any;

  const controller = new UsersController(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns current user profile', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'u@test' });
    await expect(controller.getProfile({ id: 1 } as any)).resolves.toEqual({ id: 1, email: 'u@test' });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
