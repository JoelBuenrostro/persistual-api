import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateHabitDTO {
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateHabitDTO {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
