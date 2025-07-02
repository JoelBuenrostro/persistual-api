import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateHabitDTO {
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  description?: string;
}

export class UpdateHabitDTO {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  description?: string;
}
