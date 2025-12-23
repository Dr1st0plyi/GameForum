import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { SteamStrategy } from './strategies/steam.strategy';
import { UsersModule } from '../users/users.module';
import { SteamModule } from '../steam/steam.module';

export const jwtModuleOptionsFactory = (configService: ConfigService): JwtModuleOptions => ({
  secret: configService.getOrThrow<string>('JWT_SECRET'),
  signOptions: { expiresIn: '1h' },
});

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    SteamModule,
    PassportModule.register({ session: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: jwtModuleOptionsFactory,
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, SteamStrategy],
  exports: [AuthService],
})
export class AuthModule {}
