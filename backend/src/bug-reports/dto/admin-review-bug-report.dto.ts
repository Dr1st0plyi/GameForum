import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum AdminBugReportAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export class AdminReviewBugReportDto {
  @IsEnum(AdminBugReportAction)
  action!: AdminBugReportAction;

  @IsOptional()
  @IsString()
  comment?: string;
}
