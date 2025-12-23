import { Module } from '@nestjs/common';
import { DevelopersController } from './developers.controller';
import { BugReportsModule } from '../bug-reports/bug-reports.module';

@Module({
  imports: [BugReportsModule],
  controllers: [DevelopersController],
})
export class DevelopersModule {}
