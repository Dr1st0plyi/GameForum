import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateBugReportDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;
}
