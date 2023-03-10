import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateMessageDto {
  id?: number;
  @IsNotEmpty()
  phoneNumber: string;
  @Length(5, 5000)
  @IsNotEmpty()
  message: string;
  @IsString()
  @IsNotEmpty()
  dueDate: string;
  status?: 'WAITING' | 'SENT';
}
