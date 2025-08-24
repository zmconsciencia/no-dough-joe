import { IsBoolean, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Length(1, 50)
  name!: string;

  @IsOptional()
  @IsString()
  @Matches(/^#([0-9A-Fa-f]{6})$/, { message: 'color must be like #RRGGBB' })
  color?: string;

  @IsOptional()
  @IsBoolean()
  eligibleForMealTicket?: boolean;
}
