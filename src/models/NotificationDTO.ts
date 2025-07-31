import { IsString, IsDateString } from 'class-validator';

export class NotificationDTO {
  @IsString({ message: 'El habitId debe ser texto' })
  habitId!: string;

  @IsDateString({}, { message: 'La fecha debe ser una fecha v\u00e1lida' })
  date!: string;
}
