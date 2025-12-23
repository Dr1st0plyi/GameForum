import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
export declare const jwtModuleOptionsFactory: (configService: ConfigService) => JwtModuleOptions;
export declare class AuthModule {
}
