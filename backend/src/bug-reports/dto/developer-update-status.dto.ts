import { BugReportStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class DeveloperUpdateStatusDto {
  @IsEnum(BugReportStatus)
  status!: BugReportStatus;
}
