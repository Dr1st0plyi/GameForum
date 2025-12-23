import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { BugReportsModule } from '../bug-reports/bug-reports.module';

@Module({
  imports: [UsersModule, BugReportsModule],
  controllers: [AdminController],
})
export class AdminModule {}
