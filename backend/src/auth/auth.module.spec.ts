import { ConfigService } from '@nestjs/config';
import { jwtModuleOptionsFactory } from './auth.module';

describe('AuthModule factory', () => {
  it('builds jwt options from config service', () => {
    const config = { getOrThrow: jest.fn().mockReturnValue('secret') } as unknown as ConfigService;
    const options = jwtModuleOptionsFactory(config);
    expect(options).toEqual({ secret: 'secret', signOptions: { expiresIn: '1h' } });
    expect(config.getOrThrow).toHaveBeenCalledWith('JWT_SECRET');
  });
});
