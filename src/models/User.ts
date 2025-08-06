import { IsIn } from 'class-validator';
// DTO para cambio de rol
export class UpdateUserRoleDTO {
  @IsIn(['user', 'admin'], { message: 'El rol debe ser user o admin' })
  role!: 'user' | 'admin';
}
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
