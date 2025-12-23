import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  const config = { get: jest.fn().mockReturnValue('postgresql://localhost/test') } as unknown as ConfigService;

  it('connects and disconnects gracefully', async () => {
    const prisma = new PrismaService(config);
    prisma.$connect = jest.fn().mockResolvedValue(undefined) as any;
    prisma.$disconnect = jest.fn().mockResolvedValue(undefined) as any;

    await expect(prisma.onModuleInit()).resolves.toBeUndefined();
    expect(prisma.$connect).toHaveBeenCalled();

    await expect(prisma.onModuleDestroy()).resolves.toBeUndefined();
    expect(prisma.$disconnect).toHaveBeenCalled();
  });

  it('registers shutdown hooks', async () => {
    const prisma = new PrismaService(config);
    const callbacks: Array<() => Promise<void>> = [];
    (prisma as any).$on = (_event: string, cb: () => Promise<void>) => callbacks.push(cb);

    const app = { close: jest.fn() } as any;
    await prisma.enableShutdownHooks(app as any);
    expect(callbacks).toHaveLength(1);

    await callbacks[0]();
    expect(app.close).toHaveBeenCalled();
  });
});
