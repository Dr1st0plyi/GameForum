import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateGameDto {
  @IsInt()
  @Min(1)
  steamAppId!: number;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
