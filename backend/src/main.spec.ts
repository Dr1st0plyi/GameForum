import { ValidationPipe } from '@nestjs/common';

jest.mock('@nestjs/core', () => ({
  NestFactory: { create: jest.fn() },
}));

const mockCreateDocument = jest.fn();
const mockSetup = jest.fn();

jest.mock('@nestjs/swagger', () => {
  class DocumentBuilderMock {
    setTitle() {
      return this;
    }
    setDescription() {
      return this;
    }
    setVersion() {
      return this;
    }
    addBearerAuth() {
      return this;
    }
    build() {
      return {};
    }
  }

  return {
    DocumentBuilder: DocumentBuilderMock,
    SwaggerModule: {
      createDocument: mockCreateDocument,
      setup: mockSetup,
    },
    PartialType: (Base: any) => Base,
  };
});

describe('main bootstrap', () => {
  beforeEach(() => {
    jest.resetModules();
    const { NestFactory } = require('@nestjs/core');
    (NestFactory.create as jest.Mock).mockReset();
    mockCreateDocument.mockReset();
    mockSetup.mockReset();
    delete process.env.PORT;
    delete process.env.SESSION_SECRET;
    process.env.NODE_ENV = 'test';
  });

  it('bootstraps application with swagger and pipes', async () => {
    const setGlobalPrefix1 = jest.fn();
    const enableCors1 = jest.fn();
    const use1 = jest.fn();
    const useGlobalPipes1 = jest.fn();
    const listen1 = jest.fn().mockResolvedValue(undefined);

    const mockApp1 = {
      setGlobalPrefix: setGlobalPrefix1,
      enableCors: enableCors1,
      use: use1,
      useGlobalPipes: useGlobalPipes1,
      listen: listen1,
    };

    const setGlobalPrefix2 = jest.fn();
    const enableCors2 = jest.fn();
    const use2 = jest.fn();
    const useGlobalPipes2 = jest.fn();
    const listen2 = jest.fn().mockResolvedValue(undefined);

    const mockApp2 = {
      setGlobalPrefix: setGlobalPrefix2,
      enableCors: enableCors2,
      use: use2,
      useGlobalPipes: useGlobalPipes2,
      listen: listen2,
    };

    const { NestFactory } = require('@nestjs/core');
    (NestFactory.create as jest.Mock).mockResolvedValueOnce(mockApp1).mockResolvedValueOnce(mockApp2);

    const { bootstrap } = await import('./main');
    await bootstrap();

    expect(setGlobalPrefix1).toHaveBeenCalledWith('api');
    expect(enableCors1).toHaveBeenCalled();
    expect(use1).toHaveBeenCalled();
    expect(useGlobalPipes1).toHaveBeenCalledWith(
      expect.objectContaining({
        validatorOptions: expect.objectContaining({ whitelist: true }),
      }),
    );
    expect(mockCreateDocument).toHaveBeenCalled();
    expect(mockSetup).toHaveBeenCalled();
    expect(listen1).toHaveBeenCalledWith(3000);

    process.env.PORT = '4500';
    process.env.SESSION_SECRET = 'custom-secret';
    await bootstrap();
    expect(listen2).toHaveBeenCalledWith(4500);
    delete process.env.PORT;
    delete process.env.SESSION_SECRET;
  });

  it('auto bootstraps outside of test environment', async () => {
    process.env.NODE_ENV = 'production';
    const setGlobalPrefix = jest.fn();
    const enableCors = jest.fn();
    const use = jest.fn();
    const useGlobalPipes = jest.fn();
    const listen = jest.fn().mockResolvedValue(undefined);

    const mockApp = { setGlobalPrefix, enableCors, use, useGlobalPipes, listen };
    const { NestFactory } = require('@nestjs/core');
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);

    await import('./main');

    expect(NestFactory.create).toHaveBeenCalledWith(expect.anything());
    expect(listen).toHaveBeenCalled();
  });
});
