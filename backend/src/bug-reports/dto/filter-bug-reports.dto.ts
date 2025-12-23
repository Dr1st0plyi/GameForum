import { BugReportStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class FilterBugReportsDto {
  @IsOptional()
  @IsEnum(BugReportStatus)
  status?: BugReportStatus;
}
