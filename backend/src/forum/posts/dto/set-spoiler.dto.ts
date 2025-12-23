import { IsBoolean } from 'class-validator';

export class SetSpoilerDto {
  @IsBoolean()
  isSpoiler!: boolean;
}
