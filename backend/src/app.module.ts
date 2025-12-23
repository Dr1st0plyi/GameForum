import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module';
import { ForumModule } from './forum/forum.module';
import { BugReportsModule } from './bug-reports/bug-reports.module';
import { AdminModule } from './admin/admin.module';
import { DevelopersModule } from './developers/developers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CommonModule,
    AuthModule,
    UsersModule,
    GamesModule,
    ForumModule,
    BugReportsModule,
    AdminModule,
    DevelopersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
