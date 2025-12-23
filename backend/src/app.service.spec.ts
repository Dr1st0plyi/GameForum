import { AppService } from './app.service';

describe('AppService', () => {
  it('returns health info', () => {
    const service = new AppService();
    const result = service.health();
    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });
});
