import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateThreadDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;
}
