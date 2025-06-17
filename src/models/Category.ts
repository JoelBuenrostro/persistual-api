import { IsString, MinLength } from 'class-validator';

export class CategoryDTO {
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  name!: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}
