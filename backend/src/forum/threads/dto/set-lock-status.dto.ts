import { IsBoolean } from 'class-validator';

export class SetLockStatusDto {
  @IsBoolean()
  isLocked!: boolean;
}
