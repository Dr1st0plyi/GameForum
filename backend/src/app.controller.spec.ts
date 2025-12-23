import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  it('returns health payload', () => {
    const service = new AppService();
    const controller = new AppController(service);

    const result = controller.health();

    expect(result.status).toBe('ok');
    expect(() => new Date(result.timestamp)).not.toThrow();
  });
});
