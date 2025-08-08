import { IsEmail, MinLength } from 'class-validator';

/**
 * Data Transfer Object para la creación y validación de usuarios.
 */
export class UserDTO {
  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}

export class UpdateUserDTO {
  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;
}
