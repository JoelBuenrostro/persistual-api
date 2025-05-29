import { IsEmail, MinLength } from 'class-validator';

export class UserDTO {
  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}
