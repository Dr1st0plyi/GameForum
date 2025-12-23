import { IsBoolean } from 'class-validator';

export class UpdateBanStatusDto {
  @IsBoolean()
  isBanned!: boolean;
}
