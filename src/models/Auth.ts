import { IsEmail, MinLength } from 'class-validator';

export class LoginDTO {
  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @MinLength(1, { message: 'La contraseña no puede estar vacía' })
  password!: string;
}
